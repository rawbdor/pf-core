import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import { ChainNetwork, Chains, PickleModel } from "../../src";
import { JarBehaviorDiscovery } from "../../src/behavior/JarBehaviorDiscovery";
import {
  AssetBehavior,
  ICustomHarvester,
} from "../../src/behavior/JarBehaviorResolver";
import { ALL_ASSETS } from "../../src/model/JarsAndFarms";
import {
  AssetEnablement,
  AssetType,
  HarvestStyle,
  JarDefinition,
  PickleAsset,
} from "../../src/model/PickleModelJson";
import { ExternalTokenModelSingleton } from "../../src/price/ExternalTokenModel";

describe("Testing defined model", () => {
  test("Ensure no duplicate ids", async () => {
    const err = [];
    const tmp = [];
    for (let i = 0; i < ALL_ASSETS.length; i++) {
      if (tmp.includes(ALL_ASSETS[i].id)) {
        err.push("Duplicate ID: " + ALL_ASSETS[i].id);
      }
      tmp.push(ALL_ASSETS[i].id);
    }
    console.log("Errors: " + JSON.stringify(err));
    expect(err.length).toBe(0);
  });

  test("Ensure no duplicate contracts on a single chain", async () => {
    const chains = Chains.list();
    const err = [];
    for (let i = 0; i < chains.length; i++) {
      const chainAssets = ALL_ASSETS.filter((x) => x.chain === chains[i]);
      const incremental = [];
      for (let j = 0; j < chainAssets.length; j++) {
        const contractLowercase = chainAssets[j].contract.toLowerCase();
        if (incremental.includes(contractLowercase)) {
          err.push(
            "Duplicate Contract address: " +
              chains[i] +
              ", " +
              chainAssets[j].contract.toLowerCase(),
          );
        } else {
          incremental.push(contractLowercase);
        }
      }
    }
    console.log("Errors: " + JSON.stringify(err));
    expect(err.length).toBe(0);
  });

  test("Ensure no assets have forbidden characters in api key", async () => {
    const err = [];
    for (let i = 0; i < ALL_ASSETS.length; i++) {
      if (
        ALL_ASSETS[i].details &&
        ALL_ASSETS[i].details.apiKey &&
        ALL_ASSETS[i].details.apiKey.includes("/")
      ) {
        err.push(
          ALL_ASSETS[i].details.apiKey +
            " must not include a forward slash in the api-key",
        );
      }
    }
    console.log("Errors: " + JSON.stringify(err));
    expect(err.length).toBe(0);
  });

  test("Ensure all active assets have a protocol", async () => {
    const err = [];
    const usedKeys = [];
    for (let i = 0; i < ALL_ASSETS.length; i++) {
      if (ALL_ASSETS[i].enablement !== AssetEnablement.PERMANENTLY_DISABLED) {
        if (ALL_ASSETS[i].details.apiKey === undefined) {
          err.push("Asset " + ALL_ASSETS[i].id + " has no api key");
        }
        if (usedKeys.includes(ALL_ASSETS[i].details.apiKey)) {
          err.push("Asset " + ALL_ASSETS[i].id + " has a duplicate API key");
        }
        if (usedKeys.includes(ALL_ASSETS[i].details.apiKey.toLowerCase())) {
          err.push("Asset " + ALL_ASSETS[i].id + " has a duplicate API key");
        }
        usedKeys.push(ALL_ASSETS[i].details.apiKey);
        usedKeys.push(ALL_ASSETS[i].details.apiKey.toLowerCase());
      }
    }
    console.log("Errors: " + JSON.stringify(err));
    expect(err.length).toBe(0);
  });

  test("Ensure all active assets have a behavior", async () => {
    const err = [];
    const discovery: JarBehaviorDiscovery = new JarBehaviorDiscovery();
    for (let i = 0; i < ALL_ASSETS.length; i++) {
      // TODO farms need to be brought into the fold here
      if (
        ALL_ASSETS[i].enablement !== AssetEnablement.PERMANENTLY_DISABLED &&
        ALL_ASSETS[i].type !== AssetType.STANDALONE_FARM
      ) {
        const behavior = discovery.findAssetBehavior(ALL_ASSETS[i]);
        if (behavior === undefined || behavior === null) {
          err.push(
            "Asset " + ALL_ASSETS[i].id + " has no associated behavior file",
          );
        }
      }
    }
    console.log("Errors: " + JSON.stringify(err));
    expect(err.length).toBe(0);
  });

  test("Ensure all deposit token components are in the external token model", async () => {
    const err = [];
    for (let i = 0; i < ALL_ASSETS.length; i++) {
      const components = ALL_ASSETS[i].depositToken.components;
      if (components) {
        for (let j = 0; j < components.length; j++) {
          const token = ExternalTokenModelSingleton.getToken(
            components[j],
            ALL_ASSETS[i].chain,
          );
          if (token === undefined || token === null) {
            err.push(
              "Token " +
                components[j] +
                " on chain " +
                ALL_ASSETS[i].chain +
                " is not found in the ExternalTokenModel",
            );
          }
        }
      }
    }
    console.log("Errors: " + JSON.stringify(err));
    expect(err.length).toBe(0);
  });

  test("Ensure all jars with custom harvester have a harvester", async () => {
    const err = [];
    const withCustomHarvest = ALL_ASSETS.filter(
      (x) => x.type === "jar" && x.details !== undefined,
    ).filter(
      (x) =>
        (x as JarDefinition).details.harvestStyle === HarvestStyle.CUSTOM &&
        x.enablement !== AssetEnablement.PERMANENTLY_DISABLED,
    );
    for (let i = 0; i < withCustomHarvest.length; i++) {
      const beh: AssetBehavior<PickleAsset> =
        new JarBehaviorDiscovery().findAssetBehavior(withCustomHarvest[i]);
      if (beh === undefined) {
        err.push(
          withCustomHarvest[i].details.apiKey + " has no behavior class",
        );
      } else {
        const model = new PickleModel(
          [withCustomHarvest[i]],
          new Map<ChainNetwork, Provider | Signer>(),
        );
        const harvester: ICustomHarvester | undefined = beh.getCustomHarvester(
          withCustomHarvest[i],
          model,
          undefined,
          { action: "harvest" },
        );
        if (harvester === undefined) {
          err.push(
            withCustomHarvest[i].details.apiKey + " has no custom harvester",
          );
        }
      }
    }
    console.log("Errors: " + JSON.stringify(err));
    expect(err.length).toBe(0);
  });
});
