import swaprRewarderAbi from "../../Contracts/ABIs/swapr-rewarder.json";
import { GnosisSwaprJar } from "./gnosis-swapr-jar";

export class GnosisSwaprGnoWeth extends GnosisSwaprJar {
  constructor() {
    super(swaprRewarderAbi);
  }
}