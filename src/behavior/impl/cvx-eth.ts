import { JarDefinition } from "../../model/PickleModelJson";
import { PickleModel } from "../../model/PickleModel";
import { ConvexDualReward } from "./convex-dual-reward";
import { BigNumber } from "ethers";
import erc20Abi from "../../Contracts/ABIs/erc20.json";
import { formatEther } from "ethers/lib/utils";
import { Contract as MultiContract } from "ethers-multicall";

const pool = "0xb576491f1e6e5e62f1d8f26062ee822b40b0e0d4";
export class CurveCvxEth extends ConvexDualReward {
  constructor() {
    super();
  }

  async getDepositTokenPrice(
    asset: JarDefinition,
    model: PickleModel,
  ): Promise<number> {
    const cvxToken = new MultiContract(
      model.address("cvx", asset.chain),
      erc20Abi,
    );
    const poolToken = new MultiContract(asset.depositToken.addr, erc20Abi);
    const [poolCvx, totalSupply] = await model.callMulti(
      [() => cvxToken.balanceOf(pool), () => poolToken.totalSupply()],
      asset.chain,
    );

    const cvxPrice = model.priceOfSync("cvx", asset.chain);
    const depositTokenPrice = poolCvx
      .mul("2")
      .mul(BigNumber.from((cvxPrice * 1e6).toFixed()))
      .div(totalSupply)
      .mul((1e18).toFixed())
      .div((1e6).toFixed());

    return parseFloat(formatEther(depositTokenPrice));
  }
}
