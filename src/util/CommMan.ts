import { Provider as MultiProvider } from "ethers-multicall";
import { ChainNetwork } from "..";
import { PickleModel } from "../model/PickleModel";
import { v4 as uuid } from "uuid";

// Interfaces & Types
type PendingCalls = Map<ChainNetwork, { id: string; callback: Function }[]>;
type ResolvedCalls = Map<string, any>;
type ChainConfig = {
  secondsBetweenCalls: number;
  callsPerMulticall: number;
};
type ValueOfChainNetwork = `${ChainNetwork}` | "default";
type ChainsConfigs = {
  [P in ValueOfChainNetwork]?: ChainConfig;
};

// Configs
const COMMAN_CONFIGS = {
  waitForNewCall: 2, // seconds to wait before starting sending pending calls
  getResponseInterval: 2,
};
const CHAINS_CONFIGS: ChainsConfigs = {
  default: { secondsBetweenCalls: 1, callsPerMulticall: 100 },
  eth: { secondsBetweenCalls: 1, callsPerMulticall: 100 },
  aurora: { secondsBetweenCalls: 1, callsPerMulticall: 50 },
  fantom: { secondsBetweenCalls: 1, callsPerMulticall: 100 },
};

// Helpers
const GLOBAL_DEBUG_FLAG = true;
const DEBUG_OUT = (str: string): void => {
  if (GLOBAL_DEBUG_FLAG) console.log(str);
};
const isError = (err: unknown): err is Error => err instanceof Error;
// const isError = (err: any): boolean => err && err.stack && err.message && typeof err.stack === 'string' 
// && typeof err.message === 'string';

export class ComMan {
  private pendingCalls: PendingCalls;
  private resolvedCalls: ResolvedCalls;
  private lastUpdated: number; // when was the last call added to pendingCalls
  private isCalling: boolean;
  private model: PickleModel;
  private configs: ChainsConfigs;
  sweepIntervalId: NodeJS.Timeout;

  constructor(model: PickleModel, config: ChainsConfigs = undefined) {
    this.model = model;
    this.configs = config ?? CHAINS_CONFIGS;
    this.lastUpdated = 0;
    this.isCalling = false;
    this.pendingCalls = new Map<
      ChainNetwork,
      { id: string; callback: any }[]
    >();
    Object.keys(ChainNetwork).forEach(
      (chain) => (this.pendingCalls[ChainNetwork[chain]] = []),
    );
    this.resolvedCalls = new Map<string, any>();
    this.sweepIntervalId = setInterval(this.sweepPendingCalls.bind(this), 2000);
  }

  // the entry function that puts an ethers-multicall in the ComMan calls queue, returns the response if resolve, or undefined if rejected
  async call(
    contractCallback: Function | Function[],
    chain: ChainNetwork,
  ): Promise<any> {
    this.lastUpdated = Date.now();

    if (Array.isArray(contractCallback)) {
      const ids = [];
      contractCallback.forEach((c) => {
        const id = uuid();
        this.pendingCalls[chain].push({ callback: c, id: id });
        ids.push(id);
      });

      return Promise.all(ids.map((id) => this.getResponse(id)));
    } else {
      const id = uuid();
      this.pendingCalls[chain].push({ callback: contractCallback, id: id });

      return this.getResponse(id);
    }
  }

  // gets the call response from the resolvedCalls queue, keeps checking for responses every 2 seconds
  private async getResponse(id: string): Promise<any> {
    let res: any;

    while (res === undefined) {
      await new Promise((resolve) =>
        setTimeout(resolve, COMMAN_CONFIGS.getResponseInterval * 1000),
      );
      res = this.resolvedCalls[id];
    }
    if (isError(res)) return await Promise.reject(res);
    return res;
  }

  // starts sending pending calls to the RPCs if no new call is added to the queue for 2 seconds
  private async sweepPendingCalls() {
    if (
      !this.isCalling &&
      Date.now() - this.lastUpdated > COMMAN_CONFIGS.waitForNewCall * 1000
    ) {
      this.isCalling = true;
      await Promise.all(
        Object.keys(this.pendingCalls).map((chain) => {
          if (this.pendingCalls[chain].length > 0)
            return this.executeChainCalls(<ChainNetwork>chain);
        }),
      );
      this.isCalling = false;
    }
  }

  private async executeChainCalls(chain: ChainNetwork) {
    const maxCalls = (this.configs[chain] ?? this.configs.default)
      .callsPerMulticall;
    const multiProvider: MultiProvider = this.model.multicallProviderFor(chain);
    await multiProvider.init();
    const ids = this.pendingCalls[chain].map((x) => x.id);
    const callbacks: Function[] = this.pendingCalls[chain].map(
      (x) => x.callback,
    );

    let tmpIds: string[] = [];
    let tmpCallbacks: Function[] = [];
    for (let i = 0; i < callbacks.length; i++) {
      tmpCallbacks.push(callbacks[i]);
      tmpIds.push(ids[i]);
      if (tmpCallbacks.length === maxCalls) {
        try {
          await this.ternaryExecuteTmpCalls(
            tmpCallbacks,
            tmpIds,
            multiProvider,
            chain,
          );
        } catch (error) {
          this.model.logError("executeChainCalls", error);
        }
        tmpIds = [];
        tmpCallbacks = [];
      }
    }
    await this.ternaryExecuteTmpCalls(
      tmpCallbacks,
      tmpIds,
      multiProvider,
      chain,
    );
  }

  // sends a batch of multicalls, if it fails, performs a basic ternary search to pinpoint the culprit call/calls
  private async ternaryExecuteTmpCalls(
    tmpCallbacks: Function[],
    tmpIds: string[],
    multiProvider: MultiProvider,
    chain: ChainNetwork,
    delay: number = 0,
  ) {
    try {
      await new Promise((resolve) => setTimeout(resolve, delay * 1000));
      await this.executeTmpCalls(tmpCallbacks, tmpIds, multiProvider, chain);
      return Promise.resolve();
    } catch (error) {
      this.model.logError(
        "ternaryExecuteTmpCalls",
        error,
        `${chain} multicall failed`,
      );
      if (tmpIds.length === 1) {
        const id = tmpIds[0];
        this.resolvedCalls[id] = error;
        this.deletePendingCall(chain, id);
        return;
      }
      const tmpCallsChunks = [];
      const tmpIdsChunks = [];
      const chunkSize = Math.ceil(tmpIds.length / 3);
      for (let i = 0; i < tmpIds.length; i += chunkSize) {
        const callsChunk = tmpCallbacks.slice(i, i + chunkSize);
        const idsChunk = tmpIds.slice(i, i + chunkSize);
        tmpCallsChunks.push(callsChunk);
        tmpIdsChunks.push(idsChunk);
      }
      await Promise.allSettled(
        tmpIdsChunks.map((ids, i) =>
          this.ternaryExecuteTmpCalls(
            tmpCallsChunks[i],
            ids,
            multiProvider,
            chain,
            delay ? delay : this.calculateDelay(tmpIds.length),
          ),
        ),
      );
    }
  }

  private async executeTmpCalls(
    tmpCallbacks: Function[],
    tmpIds: string[],
    multiProvider: MultiProvider,
    chain: ChainNetwork,
  ) {
    const delay = (this.configs[chain] ?? this.configs["default"])
      .secondsBetweenCalls;
    DEBUG_OUT(`executeTmpCalls ${delay}-seconds delay`);
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    DEBUG_OUT(`executeTmpCalls ${delay}-seconds delay end`);
    DEBUG_OUT(`sending ${tmpIds.length} calls to ${chain} multiProvider`);
    const responses = await multiProvider.all(tmpCallbacks.map((c) => c()));
    responses.forEach((res, idx) => {
      const id = tmpIds[idx];
      this.resolvedCalls[id] = res;
      this.deletePendingCall(chain, id);
    });
  }

  private deletePendingCall(chain: ChainNetwork, id: string) {
    const index = this.pendingCalls[chain].findIndex((call) => call.id === id);
    if (index !== -1) {
      this.pendingCalls[chain].splice(index, 1);
    } else {
      this.model.logError("deletePendingCall", "pending call not found");
    }
  }

  // adds 1 second delay inbetween RPC calls
  private calculateDelay(numberOfCalls: number) {
    let remaining = numberOfCalls;
    let delay = 0;
    while (remaining > 1) {
      remaining = Math.ceil(remaining / 3);
      delay += 1;
    }
    return delay;
  }
}
