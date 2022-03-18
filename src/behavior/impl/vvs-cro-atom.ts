import { sushiStrategyAbi } from "../../Contracts/ABIs/sushi-strategy.abi";
import { CronosVvsJar } from "./cronos-vvs-jar";

export class VvsCroAtom extends CronosVvsJar {
  constructor() {
    super(sushiStrategyAbi);
  }
}
