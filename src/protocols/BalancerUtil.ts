import { BigNumber, Contract, ethers } from "ethers";
import balVaultABI from "../Contracts/ABIs/balancer_vault.json";
import erc20 from "../Contracts/ABIs/erc20.json";
import { ChainNetwork, PickleModel } from "..";
import fetch from "cross-fetch";
import { readQueryFromGraphDetails } from "../graph/TheGraph";
import {
  AssetAprComponent,
  AssetProtocol,
  HistoricalYield,
  JarDefinition,
} from "../model/PickleModelJson";
// import { ARBITRUM_SECONDS_PER_BLOCK } from "../chain/Chains";

const balLMUrl =
  "https://raw.githubusercontent.com/balancer-labs/frontend-v2/master/src/lib/utils/liquidityMining/MultiTokenLiquidityMining.json";
const balVaultAddr = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";

// Liquidity mining started on June 1, 2020 00:00 UTC
const liquidityMiningStartTime = Date.UTC(2020, 5, 1, 0, 0);

function getCurrentLiquidityMiningWeek() {
  const dateLeft = toUtcTime(new Date());
  const dateRight = liquidityMiningStartTime;
  const diff = differenceInDays(dateLeft, dateRight) / 7;
  const roundingFunc = (value: number) =>
    value < 0 ? Math.ceil(value) : Math.floor(value); // Math.trunc is not supported by IE
  const diffInWeeksRet = roundingFunc(diff);
  return diffInWeeksRet + 1;
}

// Balancer stuff
function toUtcTime(date: Date) {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
}

function getWeek(miningWeek: number) {
  return `week_${miningWeek}`;
}

type LiquidityMiningPools = Record<
  string,
  { tokenAddress: string; amount: number }[]
>;

type LiquidityMiningWeek = Array<{
  chainId: number;
  pools: LiquidityMiningPools;
}>;

const balPoolIds: { [poolTokenAddress: string]: string } = {
  "0x64541216bafffeec8ea535bb71fbc927831d0595":
    "0x64541216bafffeec8ea535bb71fbc927831d0595000100000000000000000002", // bal tricrypto
  "0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac":
    "0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac000200000000000000000017", // bal pickle-eth
};

interface Tokens {
  [tokenAddres: string]: {
    decimals: number;
    priceId: string;
  };
}

const TOKENS: Tokens = {
  "0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8": {
    decimals: 18,
    priceId: "bal",
  },
  "0x965772e0e9c84b6f359c8597c891108dcf1c5b1a": {
    decimals: 18,
    priceId: "pickle",
  },
  "0x82af49447d8a07e3bd95bd0d56f35241523fbab1": {
    decimals: 18,
    priceId: "weth",
  },
  "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8": {
    priceId: "usdc",
    decimals: 6,
  },
  "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f": {
    priceId: "wbtc",
    decimals: 8,
  },
};

interface GraphResponse {
  address: string;
  totalLiquidity: number;
  totalSwapFee: number;
}

export interface PoolData {
  pricePerToken: number;
  totalPoolValue: number;
  totalSupply: number;
}

export const queryTheGraph = async (
  poolAddress: string,
  blockNumber: number,
): Promise<GraphResponse> => {
  blockNumber -= 300; // safety buffer, the graph can take more than 1000 blocks to update!
  const query = `{ pools(first: 1, skip: 0, block: {number: ${blockNumber}}, where: {address_in: ["${poolAddress}"]}) {\n    address\n    totalLiquidity\n    totalSwapFee\n  }\n}`;
  const res = await readQueryFromGraphDetails(
    query,
    AssetProtocol.BALANCER,
    ChainNetwork.Arbitrum,
  );
  const poolData = res?.data?.pools[0];
  try {
    return {
      address: <string>poolData.address,
      totalLiquidity: +poolData.totalLiquidity,
      totalSwapFee: +poolData.totalSwapFee,
    } as GraphResponse;
  } catch (error) {
    console.log(error);
    console.log(res);
  }
};

export const getBalancerPoolDayAPY = async (
  poolAddress: string,
  model: PickleModel,
) => {
  // const arbBlocktime = ARBITRUM_SECONDS_PER_BLOCK   // TODO: uncomment this line once the value is corrected in Chains.ts
  const arbBlocktime = 3; // in Chains.ts the value is set to 13
  const provider = model.providerFor(ChainNetwork.Arbitrum);
  const blockNum = await provider.getBlockNumber();
  const secondsInDay = 60 * 60 * 24;
  const blocksInDay = Math.round(secondsInDay / arbBlocktime);
  const currentPoolDayDate = await queryTheGraph(poolAddress, blockNum);
  const yesterdayPoolDayData = await queryTheGraph(
    poolAddress,
    blockNum - blocksInDay,
  );
  const lastDaySwapFee =
    currentPoolDayDate.totalSwapFee - yesterdayPoolDayData.totalSwapFee;
  const apy = (lastDaySwapFee / currentPoolDayDate.totalLiquidity) * 365 * 100;

  return { lp: apy };
};

export const getBalancerPerformance = async (
  asset: JarDefinition,
  model: PickleModel,
): Promise<HistoricalYield> => {
  const poolAddress = asset.depositToken.addr;
  const arbBlocktime = 3; // in Chains.ts the value is set to 13
  const provider = model.providerFor(asset.chain);
  const blockNum = await provider.getBlockNumber();
  const secondsInDay = 60 * 60 * 24;
  const blocksInDay = Math.round(secondsInDay / arbBlocktime);
  const [currentPoolDate, d1PoolData, d3PoolData, d7PoolData, d30PoolData] =
    await Promise.all([
      queryTheGraph(poolAddress, blockNum),
      queryTheGraph(poolAddress, blockNum - blocksInDay),
      queryTheGraph(poolAddress, blockNum - blocksInDay * 3),
      queryTheGraph(poolAddress, blockNum - blocksInDay * 7),
      queryTheGraph(poolAddress, blockNum - blocksInDay * 30),
    ]);
  const d1SwapFee = currentPoolDate.totalSwapFee - d1PoolData.totalSwapFee;
  const d3SwapFee = currentPoolDate.totalSwapFee - d3PoolData.totalSwapFee;
  const d7SwapFee = currentPoolDate.totalSwapFee - d7PoolData.totalSwapFee;
  const d30SwapFee = currentPoolDate.totalSwapFee - d30PoolData.totalSwapFee;
  const d1 = (d1SwapFee / currentPoolDate.totalLiquidity) * 365 * 100;
  const d3 = (d3SwapFee / currentPoolDate.totalLiquidity / 3) * 365 * 100;
  const d7 = (d7SwapFee / currentPoolDate.totalLiquidity / 7) * 365 * 100;
  const d30 = (d30SwapFee / currentPoolDate.totalLiquidity / 30) * 365 * 100;

  return {
    d1: d1,
    d3: d3,
    d7: d7,
    d30: d30,
  };
};

export const getPoolData = async (jar: JarDefinition, model: PickleModel) => {
  const provider = model.providerFor(jar.chain);
  const balVaultContract = new Contract(balVaultAddr, balVaultABI, provider);
  const poolTokensResp = await balVaultContract.callStatic["getPoolTokens"](
    balPoolIds[jar.depositToken.addr.toLowerCase()],
  );
  const { tokens, balances } = poolTokensResp;
  const filtered = tokens.map((tokenAddr: string, i: number) => {
    return [
      tokenAddr,
      parseFloat(
        ethers.utils.formatUnits(
          balances[i],
          TOKENS[tokenAddr.toLowerCase()].decimals,
        ),
      ),
    ];
  });
  const poolContract = new Contract(jar.depositToken.addr, erc20, provider);
  const poolTokenTotalSupplyBN: BigNumber = await poolContract.totalSupply();
  const poolTokenTotalSupply = parseFloat(
    ethers.utils.formatUnits(poolTokenTotalSupplyBN.toString(), 18),
  ); // balancer LP tokens always have 18 decimals
  const poolTotalBalanceUSD = filtered.reduce(
    (total: number, token: [string, number]) => {
      const tokenAddress = token[0].toLowerCase();
      const tokenValueUSD = token[1] * model.priceOfSync(tokenAddress);
      return total + tokenValueUSD;
    },
    0,
  );
  return {
    totalPoolValue: +poolTotalBalanceUSD,
    totalSupply: poolTokenTotalSupply,
    pricePerToken: poolTotalBalanceUSD / poolTokenTotalSupply,
  };
};

export const calculateBalPoolAPRs = async (
  depositToken: string,
  model: PickleModel,
  poolData: PoolData,
): Promise<AssetAprComponent[]> => {
  const weeksLMResp = await fetch(balLMUrl);
  const weeksLMData = await weeksLMResp.json();
  const miningWeek = getCurrentLiquidityMiningWeek();
  let currentWeekData = weeksLMData[getWeek(miningWeek)] as LiquidityMiningWeek;
  let n = 1;
  while (!currentWeekData && miningWeek - n >= 1) {
    // balLMUrl can take some time to include current week rewards
    currentWeekData = weeksLMData[
      getWeek(miningWeek - n)
    ] as LiquidityMiningWeek;
    n++;
  }
  if (!currentWeekData) {
    return [] as AssetAprComponent[];
  }
  const miningRewards: LiquidityMiningPools = {};
  if (currentWeekData) {
    Object.assign(
      miningRewards,
      currentWeekData.find((pool) => pool.chainId === 42161)?.pools,
    );
  }

  const { totalPoolValue } = poolData;

  const poolRewardsPerWeek =
    miningRewards[balPoolIds[depositToken.toLowerCase()]];
  const poolAprComponents: AssetAprComponent[] = poolRewardsPerWeek.map(
    (reward) => {
      const rewardValue =
        reward.amount *
        model.priceOfSync(TOKENS[reward.tokenAddress.toLowerCase()].priceId);
      const name = TOKENS[reward.tokenAddress.toLowerCase()].priceId;
      const apr = (((rewardValue / 7) * 365) / totalPoolValue) * 100;
      return { name: name, apr: apr, compoundable: true };
    },
  );

  const lp: AssetAprComponent = {
    name: "lp",
    apr: (await getBalancerPoolDayAPY(depositToken, model)).lp,
    compoundable: false,
  };

  poolAprComponents.push(lp);

  return poolAprComponents;
};

/*
 Stuff copied from somewhere else
 */

function differenceInDays(
  dirtyDateLeft: Date | number,
  dirtyDateRight: Date | number,
): number {
  const dateLeft = toDate(dirtyDateLeft);
  const dateRight = toDate(dirtyDateRight);

  const sign = compareLocalAsc(dateLeft, dateRight);
  const difference = Math.abs(differenceInCalendarDays(dateLeft, dateRight));

  dateLeft.setDate(dateLeft.getDate() - sign * difference);

  // Math.abs(diff in full days - diff in calendar days) === 1 if last calendar day is not full
  // If so, result must be decreased by 1 in absolute value
  const isLastDayNotFull = Number(
    compareLocalAsc(dateLeft, dateRight) === -sign,
  );
  const result = sign * (difference - isLastDayNotFull);
  // Prevent negative zero
  return result === 0 ? 0 : result;
}

export default function toDate(argument: Date | number): Date {
  const argStr = Object.prototype.toString.call(argument);

  // Clone the date
  if (
    argument instanceof Date ||
    (typeof argument === "object" && argStr === "[object Date]")
  ) {
    // Prevent the date to lose the milliseconds when passed to new Date() in IE10
    return new Date(argument.getTime());
  } else if (typeof argument === "number" || argStr === "[object Number]") {
    return new Date(argument);
  } else {
    if (
      (typeof argument === "string" || argStr === "[object String]") &&
      typeof console !== "undefined"
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        "Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule",
      );
      // eslint-disable-next-line no-console
      console.warn(new Error().stack);
    }
    return new Date(NaN);
  }
}

function compareLocalAsc(dateLeft: Date, dateRight: Date): number {
  const diff =
    dateLeft.getFullYear() - dateRight.getFullYear() ||
    dateLeft.getMonth() - dateRight.getMonth() ||
    dateLeft.getDate() - dateRight.getDate() ||
    dateLeft.getHours() - dateRight.getHours() ||
    dateLeft.getMinutes() - dateRight.getMinutes() ||
    dateLeft.getSeconds() - dateRight.getSeconds() ||
    dateLeft.getMilliseconds() - dateRight.getMilliseconds();

  if (diff < 0) {
    return -1;
  } else if (diff > 0) {
    return 1;
    // Return 0 if diff is 0; return NaN if diff is NaN
  } else {
    return diff;
  }
}

const MILLISECONDS_IN_DAY = 86400000;
function differenceInCalendarDays(
  dirtyDateLeft: Date | number,
  dirtyDateRight: Date | number,
): number {
  const startOfDayLeft = startOfDay(dirtyDateLeft);
  const startOfDayRight = startOfDay(dirtyDateRight);

  const timestampLeft =
    startOfDayLeft.getTime() - getTimezoneOffsetInMilliseconds(startOfDayLeft);
  const timestampRight =
    startOfDayRight.getTime() -
    getTimezoneOffsetInMilliseconds(startOfDayRight);

  // Round the number of days to the nearest integer
  // because the number of milliseconds in a day is not constant
  // (e.g. it's different in the day of the daylight saving time clock shift)
  return Math.round((timestampLeft - timestampRight) / MILLISECONDS_IN_DAY);
}

function startOfDay(dirtyDate: Date | number): Date {
  const date = toDate(dirtyDate);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getTimezoneOffsetInMilliseconds(date) {
  const utcDate = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ),
  );
  utcDate.setUTCFullYear(date.getFullYear());
  return date.getTime() - utcDate.getTime();
}
