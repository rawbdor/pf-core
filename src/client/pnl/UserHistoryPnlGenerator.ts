import { BigNumber } from "ethers";
import { Lot, PnlRollingDataWithLots, PnlTxn, PnlTransactionWrapper, UserTx, StakingRewards, UserTransfer } from "./UserHistoryInterfaces";

export const getPnlTxn = (txn: UserTx): PnlTxn => {
  if (txn.transaction_type === "ZAPIN") {
    return getZapInPnlTx(txn);
  }
  if (txn.transaction_type === "DEPOSIT") {
    return getDepositPnlTx(txn);
  }
  if (txn.transaction_type === "ZAPIN") {
    return getZapInPnlTx(txn);
  }
  if (txn.transaction_type === "ZAPOUT") {
    return getZapOutPnlTx(txn);
  }
  if (txn.transaction_type === "WITHDRAW") {
    return getWithdrawPnlTx(txn);
  }
  return undefined;
};

const getRollingData = (userTx: UserTx, wrappers: PnlTransactionWrapper[]): PnlRollingDataWithLots | undefined => {
  if (userTx.transaction_type === "DEPOSIT") {
    return getDepositPnlEntry(userTx, wrappers);
  }
  if (userTx.transaction_type === "WITHDRAW") {
    return getWithdrawPnlEntry(userTx, wrappers, false);
  }
  if (userTx.transaction_type === "ZAPIN") {
    const r = getDepositPnlEntry(userTx, wrappers);
    r.lots = applyStakeToRollingTotals(userTx, r.lots);
    return r;
  }
  if (userTx.transaction_type === "ZAPOUT") {
    const r = getWithdrawPnlEntry(userTx, wrappers, true);
    return r;
  }
  // TODO add stake and unstake locking of tokens
  if (userTx.transaction_type === "STAKE") {
    // lock tokens from earliest lots
    return getStakePnlEntry(userTx, wrappers);
  }
  if (userTx.transaction_type === "UNSTAKE") {
    // unlock tokens from earliest lots
    return getUnstakePnlEntry(userTx, wrappers);
  }
  return undefined;
};

export const generatePnL = (userJarHistory: UserTx[]): PnlTransactionWrapper[] => {
  const ret: PnlTransactionWrapper[] = [];
  for (let i = 0; i < userJarHistory.length; i++ ) {
    const rollingData: PnlRollingDataWithLots = getRollingData(userJarHistory[i], ret);
    const currentRewards: StakingRewards = getRewardsFromUserTx(userJarHistory[i]);
    const rewardProps = Object.getOwnPropertyNames(currentRewards);
    for( let j = 0; j < rewardProps.length; j++ ) {
      const prev = rollingData.rollingRewards[rewardProps[j]] || [];
      rollingData.rollingRewards[rewardProps[j]] = prev.concat(currentRewards[rewardProps[j]]);
    }
    ret.push({
      userTransaction: userJarHistory[i],
      pnlRollingDataWithLots: rollingData,
      transactionRewards: currentRewards
    });
  }
  return ret;
};

const getRewardsFromUserTx = (userTx: UserTx): StakingRewards => {
  const filtered: UserTransfer[] = userTx.transfers.filter((x) => x.transfer_type === 'STAKE_REWARD');
  const ret: StakingRewards = {};
  for( let i = 0; i < filtered.length; i++ ) {
    if( ret[filtered[i].tokenAddress] === undefined) {
      ret[filtered[i].tokenAddress] = [];
    }
    ret[filtered[i].tokenAddress].push({
      amount: filtered[i].amount,
      price: filtered[i].price,
      value: filtered[i].value
    });
  }
  return ret;
}
  
const getZapInPnlTx = (txn: UserTx): PnlTxn => {
  const r = getDepositPnlTx(txn);
  r.action = "ZAPIN";
  return r;
};


const getZapOutPnlTx = (txn: UserTx): PnlTxn => {
  const r = getWithdrawPnlTx(txn);
  r.action = "ZAPOUT";
  return r;
};

const getDepositPnlTx = (txn: UserTx): PnlTxn => {
  let usdValue = 0;
  let txCostBasis = 0;
  let ptokenWeiCount = BigNumber.from(0);
  let wantWeiCount = BigNumber.from(0);
  let tokenDecimals = 18;
  let wantDecimals = 18;
  txn.transfers.forEach((transfer) => {
    if (transfer.transfer_type === "WANT_DEPOSIT") {
      usdValue = +transfer.value.toFixed(2);
      wantWeiCount = BigNumber.from(transfer.amount);
      wantDecimals = transfer.decimals;
    }
    // this is wrong
    // if (transfer.transfer_type === 'FROM_CALLER') {
    //   usdValue = +transfer.value.toFixed(2);
    // }
    if (transfer.transfer_type === "DEPOSIT") {
      ptokenWeiCount = BigNumber.from(transfer.amount);
      tokenDecimals = transfer.decimals;
      txCostBasis = parseFloat(transfer.price);
    }
  });
  const wantCostBasis = wantWeiCount.mul(1e9).div(ptokenWeiCount).toNumber() / 1e9;
  const ret: PnlTxn = {
    action: "DEPOSIT",
    valueUSD: usdValue,
    wantWei: wantWeiCount,
    ptokenWei: ptokenWeiCount,
    decimals: tokenDecimals,
    wantDecimals: wantDecimals,
    costBasisUsdPerPToken: txCostBasis,
    costBasisWantPerPToken: wantCostBasis,
    hash: txn.hash,
    timestamp: txn.timestamp,
  };

  return ret;
};

export const multiplyBigNumberByFloat = (wei: BigNumber, price: number, decimals: number): number => {
  const priceMagnitude = price === 0 ? 0 : Math.floor(Math.log(price) / Math.log(10));
  // If magnitude is gt 4 (ie $10,000) 0, else power of 10 we need to get to 4 significant digits
  const offset = priceMagnitude > 6 ? 0 : 6 - priceMagnitude;
  const priceEnhanced = price * Math.pow(10, offset);
  const multiplied = wei.mul(Math.floor(priceEnhanced));
  const decimalsToChop = decimals + offset;
  return weiToTokens(multiplied, decimalsToChop);
}

export const weiToTokens = (wei: BigNumber, decimals: number): number => {
  return weiToTokensWithPrecission(wei, decimals, 4);
}

export const oneEn = (decimals: number): BigNumber => {
  let working: BigNumber = BigNumber.from(1);
  let toAdd = decimals;
  while( toAdd > 8 ) {
    working = working.mul(1e8);
    toAdd -= 8;
  }
  return working.mul(Math.pow(10, toAdd));
}

export const weiToTokensWithPrecission = (wei: BigNumber, decimals: number, precission: number): number => {

  const digits = wei.toString().length;
  const safelyRemove = Math.max(0, digits - precission);
  const toRemove = Math.min(safelyRemove, Math.max(0,decimals - precission));
  let toRemoveWorking = toRemove;
  let working = wei;
  while( toRemoveWorking > precission ) {
    working = working.div(Math.floor(Math.pow(10,precission)));
    toRemoveWorking -= precission;
  }
  if( toRemoveWorking > 0 ) {
    working = working.div(Math.floor(Math.pow(10, toRemoveWorking)));
    toRemoveWorking = 0;
  }
  return working.toNumber() / Math.pow(10, decimals - toRemove);
};

const getWithdrawPnlTx = (txn: UserTx): PnlTxn => {
  let ptokenValueUSD = 0;
  let wantValueUSD = 0;
  let ptokenWeiCount = BigNumber.from(0);
  let wantWeiCount = BigNumber.from(0);
  let tokenDecimals = 18;
  let wantDecimals = 18;
  let txCostBasis = 0;
  txn.transfers.forEach((transfer) => {
    if (transfer.transfer_type === "WITHDRAW") {
      ptokenValueUSD = +transfer.value.toFixed(3);
      ptokenWeiCount = BigNumber.from(transfer.amount);
      txCostBasis = parseFloat(transfer.price);
      tokenDecimals = transfer.decimals;
    }
    if (transfer.transfer_type === "WANT_WITHDRAW") {
      wantValueUSD = +transfer.value.toFixed(3);
      wantWeiCount = BigNumber.from(transfer.amount);
      wantDecimals = transfer.decimals;
    }
  });
  const valueUSD = wantValueUSD ? wantValueUSD : ptokenValueUSD;
  const wantCostBasis = wantWeiCount.mul(1e9).div(ptokenWeiCount).toNumber() / 1e9;
  const ret: PnlTxn = {
    action: "WITHDRAW",
    valueUSD: valueUSD,
    wantWei: wantWeiCount,
    ptokenWei: ptokenWeiCount,
    decimals: tokenDecimals,
    wantDecimals: wantDecimals,
    costBasisUsdPerPToken: txCostBasis,
    costBasisWantPerPToken: wantCostBasis,
    hash: txn.hash,
    timestamp: txn.timestamp,
  };
  return ret;
};

const getPreviousRollingDataOrStub = (pnlWithTotals: PnlTransactionWrapper[]): PnlRollingDataWithLots => {
  const w = getPreviousWrapperOrUndefined(pnlWithTotals);
  if( !w ) {
    return {
      rollingWeiCount: BigNumber.from(0),
      rollingCostBasis: 0,
      totalCost: 0,
      lots: [],
      rollingRewards: {},
    };
  }
  return w.pnlRollingDataWithLots;
};

const getPreviousWrapperOrUndefined = (pnlWithTotals: PnlTransactionWrapper[]): PnlTransactionWrapper => {
  if( pnlWithTotals.length === 0 ) {
    return undefined;
  }
  return pnlWithTotals[pnlWithTotals.length - 1];
};

const getDepositPnlEntry = (
  utxn: UserTx,
  pnlWithTotals: PnlTransactionWrapper[]
): PnlRollingDataWithLots => {
  const txn: PnlTxn | undefined = getPnlTxn(utxn);
  const previousRolling = getPreviousRollingDataOrStub(pnlWithTotals);
  const rollingTokenCountBN = previousRolling.rollingWeiCount.add(txn.ptokenWei);
  const rollingTokenCountNum = weiToTokens(rollingTokenCountBN, txn.decimals);
  
  const totalCost = previousRolling.totalCost + txn.valueUSD;
  const rollingCostBasis = totalCost / rollingTokenCountNum;

  const lots = previousRolling.lots.map((x) => {return {...x}});
  lots.push({
    wei: txn?.ptokenWei,
    weiRemaining: txn?.ptokenWei,
    weiLocked: BigNumber.from(0),
    costBasisUSD: txn.costBasisUsdPerPToken,
    saleProceedsUSD: 0,
    totalCostUsd: txn.valueUSD,
    totalCostWant: txn.wantWei,
    costBasisWant: txn.costBasisWantPerPToken,
    saleProceedsWant: BigNumber.from(0), // TODO
    status: "open",
    timestamp: txn.timestamp,
  });
  return {
    rollingWeiCount: rollingTokenCountBN,
    rollingCostBasis: rollingCostBasis,
    totalCost: totalCost,
    lots: lots,
    rollingRewards: JSON.parse(JSON.stringify(previousRolling.rollingRewards)),
  };
};

const getWithdrawPnlEntry = (
  utxn: UserTx,
  pnlWithTotals: PnlTransactionWrapper[],
  checkUnstake: boolean,
): PnlRollingDataWithLots => {
  const txn: PnlTxn | undefined = getPnlTxn(utxn);
  const previousRolling = getPreviousRollingDataOrStub(pnlWithTotals);
  const previousWeiOpen = previousRolling.rollingWeiCount;
  const newRollingWeiCount = previousWeiOpen.sub(txn.ptokenWei);
  const newRollingTokenCount = weiToTokens(newRollingWeiCount, txn.decimals);
  // deep clone the lots
  let previousLots: Lot[] = previousRolling.lots.map((x) => { return {...x}});
  if( checkUnstake ) {
    previousLots = applyUnstakeToRollingTotals(utxn, previousLots);
  }
  const weiLeftToClose = txn.ptokenWei;
  const valueBeingClosed = txn.valueUSD;
  const newLots = applyWithdrawToLots(txn, previousLots, weiLeftToClose, valueBeingClosed);

  let costBasisTempTotal = 0;
  for (let x = newLots.length - 1; x >= 0; x--) {
    const lotTokens = weiToTokens(newLots[x].weiRemaining, txn.decimals);
    costBasisTempTotal += (lotTokens * newLots[x].costBasisUSD);
  }
  const rollingCostBasis = newRollingTokenCount === 0 ? 0 : costBasisTempTotal / newRollingTokenCount;

  const totalCost = multiplyBigNumberByFloat(newRollingWeiCount, rollingCostBasis, txn.decimals);
  return {
    rollingWeiCount: newRollingWeiCount,
    rollingCostBasis: rollingCostBasis,
    totalCost: totalCost,
    lots: newLots,
    rollingRewards: JSON.parse(JSON.stringify(previousRolling.rollingRewards)),
  };
};

const applyWithdrawToLots = (txn: PnlTxn, previousLots: Lot[], weiLeftToClose: BigNumber, valueBeingClosed: number) => {
  // TODO replace with for loop? easier for debugging
  const tmpPrecision = 100000000;
  const newLots = previousLots.map((oneLot) => {
    if (weiLeftToClose === BigNumber.from(0) || oneLot.status === "closed") {
      return oneLot;
    }
    if (oneLot.weiRemaining.sub(weiLeftToClose).gt(BigNumber.from(0))) {
      // this lot has 300 left to close but we are only closing 100 of it
      const dollarsClosing = Math.round((weiLeftToClose.mul(tmpPrecision).div(txn.ptokenWei).toNumber()) * valueBeingClosed) / tmpPrecision;
      const wantWeiClosing = weiLeftToClose.mul(txn.wantWei).mul(oneEn(30)).div(txn.ptokenWei).div(oneEn(30));
      const ret: Lot = { ...oneLot, weiRemaining: oneLot.weiRemaining.sub(weiLeftToClose) } as Lot;
      ret.saleProceedsUSD += Math.round(dollarsClosing*1000)/1000;
      ret.saleProceedsWant = ret.saleProceedsWant.add(wantWeiClosing);
      weiLeftToClose = BigNumber.from(0);
      return ret;
    } else {
      // this lot has 300 left to close and we are closing all or more, so use all of this lot
      const dollarsClosing = Math.round((oneLot.weiRemaining.mul(tmpPrecision).div(txn.ptokenWei).toNumber()) * valueBeingClosed) / tmpPrecision;
      const wantWeiClosing = oneLot.weiRemaining.mul(txn.wantWei).mul(oneEn(30)).div(txn.ptokenWei).div(oneEn(30)); //.div(oneEn(txn.wantDecimals));
      weiLeftToClose = weiLeftToClose.sub(oneLot.weiRemaining);
      const ret: Lot = { ...oneLot, weiRemaining: BigNumber.from(0), status: "closed" } as Lot;
      ret.saleProceedsUSD += Math.round(dollarsClosing*1000)/1000;
      ret.saleProceedsWant = ret.saleProceedsWant.add(wantWeiClosing);
      return ret;
    }
  });
  return newLots;
}


const getStakePnlEntry = (
  txn: UserTx,
  pnlWithTotals: PnlTransactionWrapper[]
): PnlRollingDataWithLots => {
  const previousRolling = getPreviousRollingDataOrStub(pnlWithTotals);
  let lots = previousRolling.lots.map((x) => {return {...x}});
  lots = applyStakeToRollingTotals(txn, lots);
  return {
    rollingWeiCount: previousRolling.rollingWeiCount,
    rollingCostBasis: previousRolling.rollingCostBasis,
    totalCost: previousRolling.totalCost,
    lots: lots,
    rollingRewards: JSON.parse(JSON.stringify(previousRolling.rollingRewards)),
  };
};

const applyStakeToRollingTotals = (txn: UserTx, lots: Lot[]): Lot[] => {
  const stakeTransfer = txn.transfers.find((x) => x.transfer_type === 'STAKE');
  if( stakeTransfer ) {
    let leftToStake = BigNumber.from(stakeTransfer.amount);
    for (let i = 0; i < lots.length && leftToStake.gt(0); i++ ) {
      if (lots[i].status !== 'closed') {
        const remaining = lots[i].weiRemaining;
        const locked = lots[i].weiLocked;
        const availableToLock = remaining.sub(locked);
        if( availableToLock.gt(leftToStake)) {
          // We want to lock 100, there are 300 available to lock. Lock 100, 0 are left to stake
          lots[i].weiLocked = lots[i].weiLocked.add(leftToStake);
          leftToStake = BigNumber.from(0);
        } else {
          // We want to lock 100, there are 50 available to lock. Lock 50. There are still more to lock
          lots[i].weiLocked = lots[i].weiLocked.add(availableToLock);
          leftToStake = leftToStake.sub(availableToLock);
        }
      }
    }
  }
  return lots;
}

const getUnstakePnlEntry = (
  txn: UserTx,
  pnlWithTotals: PnlTransactionWrapper[]
): PnlRollingDataWithLots => {
  const previousRolling = getPreviousRollingDataOrStub(pnlWithTotals);
  let lots = previousRolling.lots.map((x) => {return {...x}});
  lots = applyUnstakeToRollingTotals(txn, lots);
  return {
    rollingWeiCount: previousRolling.rollingWeiCount,
    rollingCostBasis: previousRolling.rollingCostBasis,
    totalCost: previousRolling.totalCost,
    lots: lots,
    rollingRewards: JSON.parse(JSON.stringify(previousRolling.rollingRewards)),
  };
};


const applyUnstakeToRollingTotals = (txn: UserTx, lots: Lot[]): Lot[] => {
  const unstakeTransfer = txn.transfers.find((x) => x.transfer_type === 'UNSTAKE');
  if( unstakeTransfer ) {
    let leftToUnlock = BigNumber.from(unstakeTransfer.amount);
    for (let i = 0; i < lots.length && leftToUnlock.gt(0); i++ ) {
      if (lots[i].status !== 'closed') {
        const locked = lots[i].weiLocked;
        if( locked.gt(leftToUnlock)) {
          // we want to unlock 100, there are 200 locked. Unlock the 100
          lots[i].weiLocked = lots[i].weiLocked.sub(leftToUnlock);
          leftToUnlock = BigNumber.from(0);
        } else {
          // we want to unlock 100, there are 50 locked. Unlock the 50 and continue
          lots[i].weiLocked = lots[i].weiLocked.sub(locked);
          leftToUnlock = leftToUnlock.sub(locked);
        }
      }
    }
  }
  return lots;
}

export const DEBUG_OUT = (label: string, msg: any) => {
  if (GLOBAL_DEBUG) console.log(label + "\n", msg);
};
const GLOBAL_DEBUG = true;
