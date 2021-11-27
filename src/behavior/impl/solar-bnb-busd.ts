import { sushiStrategyAbi } from "../../Contracts/ABIs/sushi-strategy.abi";
import { MoonriverSolarJar } from "./moonriver-solar-jar";

export class SolarBnbBusd extends MoonriverSolarJar {
  constructor() {
    super(sushiStrategyAbi);
  }
}
