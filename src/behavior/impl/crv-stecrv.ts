import { BigNumber, ethers, Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { AssetAprComponent, AssetProjectedApr, JarDefinition } from '../../model/PickleModelJson';
import CrvRewardsABI from '../../Contracts/ABIs/crv-rewards.json';
import { Provider as MulticallProvider, Contract as MulticallContract} from 'ethers-multicall';
import { Chains } from '../../chain/Chains';
import { AbstractJarBehavior} from '../AbstractJarBehavior';
import { PickleModel } from '../../model/PickleModel';
import { formatEther } from 'ethers/lib/utils';
import { Erc20__factory } from '../../Contracts/ContractsImpl';
import { CvxBooster__factory } from '../../Contracts/ContractsImpl';
import { ONE_YEAR_SECONDS } from '../JarBehaviorResolver';
import fetch from "cross-fetch";
import { PoolInfo } from '../../protocols/ProtocolUtil';

export const CVX_BOOSTER = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
export const convexPools: PoolInfo = {
    "0x06325440D014e39736583c165C2963BA99fAf14E": {
      poolId: 25,
      tokenName: "steth",
    },
  };

export class SteCrv extends AbstractJarBehavior {
  constructor() {
    super();
  }

  async getCvxMint (crvEarned: number, model: PickleModel, provider: Provider|Signer ): Promise<number> {
    /* Adapted from https://docs.convexfinance.com/convexfinanceintegration/cvx-minting */
  
    const cliffSize = 100000; // new cliff every 100,000 tokens
      const cliffCount = 1000; // 1,000 cliffs
      const maxSupply = 100000000; // 100 mil max supply
    
      const cvx = Erc20__factory.connect(model.addr("cvx"), provider)
    
      // first get total supply
      const cvxTotalSupply = parseFloat(formatEther((await cvx.totalSupply())))
    
      // get current cliff
      const currentCliff = cvxTotalSupply / cliffSize;
    
      // if current cliff is under the max
      if (currentCliff < cliffCount) {
        // get remaining cliffs
        const remaining = cliffCount - currentCliff;
    
        // multiply ratio of remaining cliffs to total cliffs against amount CRV received
        let cvxEarned = (crvEarned * remaining) / cliffCount;
    
        // double check we have not gone over the max supply
        const amountTillMax = maxSupply - cvxTotalSupply;
        if (cvxEarned > amountTillMax) {
          cvxEarned = amountTillMax;
        }
        return cvxEarned;
      }
      return 0;
    }

  async getProjectedAprStats(definition: JarDefinition, model: PickleModel) : Promise<AssetProjectedApr> {
    const resolver : Provider | Signer = Chains.get(definition.chain).getPreferredWeb3Provider();
    const curveAPY = (await fetch(
      "https://cors.bridged.cc/https://www.convexfinance.com/api/curve-apys",
      {
        method: "GET",
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        },
      },
    ).then((x) => x.json()))?.apys;
    
    // Component 1
    const multicallProvider = new MulticallProvider(resolver);
    await multicallProvider.init();

    const cvxPool = convexPools[definition.depositToken.addr];
    if (curveAPY && multicallProvider ) {
      const lpApy = parseFloat(curveAPY[cvxPool.tokenName]?.baseApy);
      const crvApy = parseFloat(curveAPY[cvxPool.tokenName]?.crvApy);
      const rewardApy = parseFloat(curveAPY[cvxPool.tokenName]?.additionalRewards[0].apy);

      const poolInfo = await CvxBooster__factory.connect(CVX_BOOSTER, resolver).poolInfo(cvxPool.poolId)

      const crvRewardsMC = new MulticallContract(
        poolInfo.crvRewards,
        CrvRewardsABI,
      );

      const [crvReward, depositLocked, duration] = await multicallProvider.all([
        crvRewardsMC.currentRewards(),
        crvRewardsMC.totalSupply(),
        crvRewardsMC.duration()
      ])

      const isStEth = cvxPool.tokenName === "steth"
      
      const poolValue = parseFloat(formatEther(depositLocked)) * ( isStEth ? await model.priceOf("weth") : 0);
      
      const cvxReward = await this.getCvxMint(parseFloat(formatEther(crvReward)), model, resolver)
      const cvxValuePerYear = cvxReward * await model.priceOf("cvx") * ONE_YEAR_SECONDS / duration.toNumber(); 
      
      const cvxApy = cvxValuePerYear / poolValue * 100

      const components: AssetAprComponent[] = [
        this.createAprComponent("LP", lpApy, false),
        this.createAprComponent("CRV", crvApy, true),
        this.createAprComponent("CVX", cvxApy, true),
        this.createAprComponent("LDO", rewardApy, true)
      ];
      return this.aprComponentsToProjectedApr(components);
    }
    return undefined;
  }

  // TODO needs to complete
  async getHarvestableUSD( _jar: JarDefinition, _model: PickleModel, _resolver: Signer | Provider): Promise<number> {
    /*
    const lido = new ethers.Contract(LIDO_ADDRESS, erc20Abi, resolver);
    const gauge = new ethers.Contract(this.gaugeAddress, curveThirdPartyGaugeAbi, resolver);
    const [crv, crvPrice, ldo, ldoWallet, ldoPrice]: [BigNumber, number, BigNumber, BigNumber, number] =
      await Promise.all([
        gauge.callStatic.claimable_tokens(jar.details.strategyAddr),
        await model.priceOf('curve-dao-token'),
        gauge.callStatic.claimable_reward(jar.details.strategyAddr, LIDO_ADDRESS),
        lido.balanceOf(jar.details.strategyAddr),
        await model.priceOf('lido-dao'),
      ]);
    const lidoValue = ldo.add(ldoWallet).mul(ldoPrice.toFixed());
    const harvestable = crv.mul(crvPrice.toFixed()).add(lidoValue);
    return parseFloat(ethers.utils.formatEther(harvestable));
    */
   return 0;
  }
}
