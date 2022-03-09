import fetch from "cross-fetch";
import { Chains, PickleModel } from "../..";
import { JarDefinition, AssetProjectedApr } from "../../model/PickleModelJson";
import strategyABI from "../../Contracts/ABIs/strategy.json";
import erc20Abi from "../../Contracts/ABIs/erc20.json";
import { AbstractJarBehavior } from "../AbstractJarBehavior";
import { ExternalTokenModelSingleton } from "../../price/ExternalTokenModel";
import { Contract as MultiContract } from "ethers-multicall";
import { BigNumber, ethers } from "ethers";

export class NetswapJar extends AbstractJarBehavior {
  private poolsStats: any;
  constructor() {
    super();
  }

  async getHarvestableUSD(
    jar: JarDefinition,
    model: PickleModel,
  ): Promise<number> {
    !this.poolsStats && (await this.getPoolsStats(jar, model));
    const poolStats = this.poolsStats?.data?.farmPools?.filter(
      (x) => x.pair.id.toLowerCase() === jar.depositToken.addr.toLowerCase(),
    );
    const rewarder = poolStats[0]?.rewarder;

    if (rewarder) {
      const rewardTokenAddr = rewarder.rewardToken.address;
      let tokenId: string;
      try {
        tokenId = ExternalTokenModelSingleton.getToken(
          rewardTokenAddr,
          jar.chain,
        ).id;
      } catch (error) {
        model.logError(
          `getHarvestableUSD [${jar.details.apiKey}]`,
          error,
          `
          Token: ${rewardTokenAddr}, is not known to PF-Core.
          Consider adding it to ExternalTokenModel
          `,
        );
      }
      return this.getHarvestableMultiRewards(jar, model, ["nett", tokenId]);
    } else {
      return this.getHarvestableUSDComManImplementation(
        jar,
        model,
        ["nett"],
        strategyABI,
      );
    }
  }

  // required because the strategy's getHarvestable is broken for multi-rewards jars.
  async getHarvestableMultiRewards(
    jar: JarDefinition,
    model: PickleModel,
    _rewardTokensIds: string[],
  ) {
    const stratAbi = [
      {
        inputs: [],
        name: "masterchef",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "poolId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ];
    const chefAbi = [
      {
        type: "function",
        stateMutability: "view",
        outputs: [
          { type: "uint256", name: "pendingNETT", internalType: "uint256" },
          {
            type: "address",
            name: "bonusTokenAddress",
            internalType: "address",
          },
          { type: "string", name: "bonusTokenSymbol", internalType: "string" },
          {
            type: "uint256",
            name: "pendingBonusToken",
            internalType: "uint256",
          },
        ],
        name: "pendingTokens",
        inputs: [
          { type: "uint256", name: "_pid", internalType: "uint256" },
          { type: "address", name: "_user", internalType: "address" },
        ],
      },
    ];
    const strategyContract = new MultiContract(
      jar.details.strategyAddr,
      stratAbi,
    );
    const [chefAddress, poolId] = await model.comMan.call(
      [() => strategyContract.masterchef(), () => strategyContract.poolId()],
      jar.chain,
    );
    const chefContract = new MultiContract(chefAddress, chefAbi);
    const rewardTokens = await model.comMan.call(
      () => chefContract.pendingTokens(poolId, jar.details.strategyAddr),
      jar.chain,
    );

    let pendingHarvests: {
      [address: string]: {
        address: string;
        id: string;
        value: number;
        decimals: number;
        price: number;
      };
    } = {};

    const nettToken = ExternalTokenModelSingleton.getToken("nett", jar.chain);
    const bonusToken = ExternalTokenModelSingleton.getToken(
      rewardTokens.bonusTokenAddress,
      jar.chain,
    );
    const nettAmount = parseFloat(
      ethers.utils.formatEther(rewardTokens.pendingNETT),
    );
    const bonusAmount = parseFloat(
      ethers.utils.formatUnits(
        rewardTokens.pendingBonusToken,
        bonusToken.decimals,
      ),
    );
    const nettValue = nettAmount * model.priceOfSync("nett", jar.chain);
    const bonusValue =
      bonusAmount * model.priceOfSync(bonusToken.id, jar.chain);
    pendingHarvests[nettToken.contractAddr] = {
      address: nettToken.contractAddr,
      id: nettToken.id,
      value: nettValue,
      decimals: nettToken.decimals,
      price: model.priceOfSync("nett", jar.chain),
    };
    pendingHarvests[bonusToken.contractAddr] = {
      address: bonusToken.contractAddr,
      id: bonusToken.id,
      value: bonusValue,
      decimals: bonusToken.decimals,
      price: model.priceOfSync(bonusToken.id, jar.chain),
    };

    const rewardTokensAddresses = Object.keys(pendingHarvests);
    const stratBalancesBN: BigNumber[] = await model.comMan.call(
      rewardTokensAddresses.map(
        (address) => () =>
          new MultiContract(address, erc20Abi).balanceOf(
            jar.details.strategyAddr,
          ),
      ),
      jar.chain,
    );

    const stratBalances = stratBalancesBN.map((bal, idx) => {
      const balance = parseFloat(
        ethers.utils.formatUnits(
          bal,
          pendingHarvests[rewardTokensAddresses[idx]].decimals,
        ),
      );
      const balanceUSD =
        balance * pendingHarvests[rewardTokensAddresses[idx]].price;
      return balanceUSD;
    });

    let runningTotal = 0;
    rewardTokensAddresses.forEach(
      (addr) => (runningTotal += pendingHarvests[addr].value),
    );
    stratBalances.forEach((bal) => (runningTotal += bal));

    return runningTotal;
  }

  async getProjectedAprStats(
    jar: JarDefinition,
    model: PickleModel,
  ): Promise<AssetProjectedApr> {
    !this.poolsStats && (await this.getPoolsStats(jar, model));
    const poolStats = this.poolsStats?.data?.farmPools?.filter(
      (x) => x.pair.id.toLowerCase() === jar.depositToken.addr.toLowerCase(),
    );
    const components = [];
    if (poolStats && poolStats.length > 0 && poolStats[0]) {
      const nettApy = poolStats[0].nettApy || 0;
      const rewarderApy = poolStats[0].rewarderApy || 0;
      const retained = 1 - Chains.get(jar.chain).defaultPerformanceFee;
      components.push(
        this.createAprComponent("lp", poolStats[0]?.lpApy, false),
      );
      if (nettApy) {
        components.push(
          this.createAprComponent("nett", nettApy, true, retained),
        );
      }
      if (rewarderApy) {
        const rewarderToken =
          poolStats[0].rewarder?.rewardToken?.symbol || "Reward Token";
        components.push(
          this.createAprComponent(rewarderToken, rewarderApy, true, retained),
        );
      }
    }
    return this.aprComponentsToProjectedApr(components);
  }

  async getPoolsStats(jar: JarDefinition, model: PickleModel) {
    try {
      const resp = await fetch(NETSWAP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const json = await resp.json();
      this.poolsStats = json;
    } catch (error) {
      model.logError(`getPoolsStats [${jar.details.apiKey}]`, error);
    }
  }
}

const NETSWAP_URL = "https://api.netswap.io/microservice/api/graphql";

const query = `query {
    farmPools(skip: 0, limit: 100) {
      id
      allocPoint
      pair {
        id
        token0 {
          address
          decimals
          symbol
          name
          __typename
        }
        token1 {
          address
          decimals
          symbol
          name
          __typename
        }
        totalSupply
        reserveUSD
        __typename
      }
      lpApy
      rewarderApy
      nettApy
      totalDepositVolumeUSD
      rewarder {
        id
        endTimestamp
        rewardToken {
          address
          decimals
          symbol
          name
          __typename
        }
        tokenPerSec
        __typename
      }
      nettPerSec
      __typename
    }
  }`;
