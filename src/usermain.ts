import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { ChainNetwork, PickleModelJson } from ".";
import fetch from 'cross-fetch';
import { UserModel } from "./client/UserModel";
import { ethers } from "ethers";

async function generateUserData(walletId: string) {
  const core = await fetch(
    "https://api.pickle.finance/prod/protocol/pfcore",
  ).then((response) => response.json());
  const map : Map<ChainNetwork, Provider | Signer> = new Map();
  map.set(ChainNetwork.Ethereum, new ethers.providers.InfuraProvider());
  map.set(ChainNetwork.Polygon, new ethers.providers.JsonRpcProvider('https://matic-mainnet.chainstacklabs.com/'));
  const userModel : UserModel = new UserModel(core as PickleModelJson.PickleModelJson, walletId, map);
  const earnings = await userModel.generateUserModel();
  if( earnings) {
    const resultString = JSON.stringify(earnings, null, 2);
    process.stdout.write(resultString);
  }
}

if( process.argv.length !== 3) {
  console.log("Please pass a wallet");
} else {
  generateUserData(process.argv[2]);
}
//generateUserData('0x...');