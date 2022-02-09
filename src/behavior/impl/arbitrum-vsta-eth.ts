import { PickleModel } from "../..";
import {
  AssetProjectedApr,
  HistoricalYield,
  JarDefinition,
} from "../../model/PickleModelJson";
import stakingRewardsAbi from "../../Contracts/ABIs/staking-rewards.json";
import { BalancerJar } from "./balancer-jar";
import { getBalancerPoolDayAPY } from "../../protocols/BalancerUtil";
import { Contract as MulticallContract } from "ethers-multicall";
import { formatEther } from "ethers/lib/utils";
import { ONE_YEAR_SECONDS } from "../JarBehaviorResolver";
import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import { sushiStrategyAbi } from "../../Contracts/ABIs/sushi-strategy.abi";

export class BalancerVstaEth extends BalancerJar {
  private rewardAddress = "0x65207da01293C692a37f59D1D9b1624F0f21177c";

  constructor() {
    super();
  }
  async getProjectedAprStats(
    jar: JarDefinition,
    model: PickleModel,
  ): Promise<AssetProjectedApr> {
    // const lp = await getBalancerPoolDayAPY(jar, model);

    const multicallProvider = model.multicallProviderFor(jar.chain);
    await multicallProvider.init();

    const multicallUniStakingRewards = new MulticallContract(
      this.rewardAddress,
      stakingRewardsAbi,
    );

    const [rewardRateBN, totalSupplyBN] = await multicallProvider.all([
      multicallUniStakingRewards.rewardRate(),
      multicallUniStakingRewards.totalStaked(),
    ]);

    const totalSupply = parseFloat(formatEther(totalSupplyBN));
    const rewardRate = parseFloat(formatEther(rewardRateBN));

    const pricePerToken = await model.priceOf(jar.depositToken.addr);
    const rewardsPerYear = rewardRate * ONE_YEAR_SECONDS;

    const valueRewardedPerYear = (await model.priceOf("vsta")) * rewardsPerYear;

    const totalValueStaked = totalSupply * pricePerToken;
    const vstaAPY = valueRewardedPerYear / totalValueStaked;
    return this.aprComponentsToProjectedApr([
      //   this.createAprComponent("lp", lp, false),
      this.createAprComponent("vsta", vstaAPY * 100, true),
    ]);
  }

  // Disable LP calcs b/c new pool
  async getProtocolApy(
    _definition: JarDefinition,
    _model: PickleModel,
  ): Promise<HistoricalYield> {
    return {
      d1: 0,
      d3: 0,
      d7: 0,
      d30: 0,
    };
  }

  async getHarvestableUSD(
    jar: JarDefinition,
    model: PickleModel,
    resolver: Signer | Provider,
  ): Promise<number> {
    return this.getHarvestableUSDDefaultImplementation(
      jar,
      model,
      resolver,
      ["vsta"],
      sushiStrategyAbi,
    );
  }
}
