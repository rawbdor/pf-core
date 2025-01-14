/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface Uniswapv2ProxyLogicInterface extends ethers.utils.Interface {
  functions: {
    "factory()": FunctionFragment;
    "lpTokensToPrimitive(address,address)": FunctionFragment;
    "optimalOneSideSupply(address,address,address)": FunctionFragment;
    "primitiveToLpTokens(address,address,address)": FunctionFragment;
    "refundDust(address,address)": FunctionFragment;
    "removeLiquidity(address)": FunctionFragment;
    "router()": FunctionFragment;
    "supplyLiquidity(address,address)": FunctionFragment;
    "swapUniLPTokens(address,address,address)": FunctionFragment;
    "swapUniswap(address,address)": FunctionFragment;
    "weth()": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "factory", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "lpTokensToPrimitive",
    values: [string, string],
  ): string;
  encodeFunctionData(
    functionFragment: "optimalOneSideSupply",
    values: [string, string, string],
  ): string;
  encodeFunctionData(
    functionFragment: "primitiveToLpTokens",
    values: [string, string, string],
  ): string;
  encodeFunctionData(
    functionFragment: "refundDust",
    values: [string, string],
  ): string;
  encodeFunctionData(
    functionFragment: "removeLiquidity",
    values: [string],
  ): string;
  encodeFunctionData(functionFragment: "router", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "supplyLiquidity",
    values: [string, string],
  ): string;
  encodeFunctionData(
    functionFragment: "swapUniLPTokens",
    values: [string, string, string],
  ): string;
  encodeFunctionData(
    functionFragment: "swapUniswap",
    values: [string, string],
  ): string;
  encodeFunctionData(functionFragment: "weth", values?: undefined): string;

  decodeFunctionResult(functionFragment: "factory", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "lpTokensToPrimitive",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "optimalOneSideSupply",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "primitiveToLpTokens",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "refundDust", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "removeLiquidity",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "router", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supplyLiquidity",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "swapUniLPTokens",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "swapUniswap",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "weth", data: BytesLike): Result;

  events: {};
}

export class Uniswapv2ProxyLogic extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>,
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>,
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: Uniswapv2ProxyLogicInterface;

  functions: {
    factory(overrides?: CallOverrides): Promise<[string]>;

    "factory()"(overrides?: CallOverrides): Promise<[string]>;

    lpTokensToPrimitive(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "lpTokensToPrimitive(address,address)"(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    optimalOneSideSupply(
      pair: string,
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "optimalOneSideSupply(address,address,address)"(
      pair: string,
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    primitiveToLpTokens(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "primitiveToLpTokens(address,address,address)"(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    refundDust(
      pair: string,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "refundDust(address,address)"(
      pair: string,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    removeLiquidity(
      pair: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "removeLiquidity(address)"(
      pair: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    router(overrides?: CallOverrides): Promise<[string]>;

    "router()"(overrides?: CallOverrides): Promise<[string]>;

    supplyLiquidity(
      token0: string,
      token1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "supplyLiquidity(address,address)"(
      token0: string,
      token1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    swapUniLPTokens(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "swapUniLPTokens(address,address,address)"(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    swapUniswap(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    "swapUniswap(address,address)"(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    weth(overrides?: CallOverrides): Promise<[string]>;

    "weth()"(overrides?: CallOverrides): Promise<[string]>;
  };

  factory(overrides?: CallOverrides): Promise<string>;

  "factory()"(overrides?: CallOverrides): Promise<string>;

  lpTokensToPrimitive(
    from: string,
    to: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "lpTokensToPrimitive(address,address)"(
    from: string,
    to: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  optimalOneSideSupply(
    pair: string,
    from: string,
    to: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "optimalOneSideSupply(address,address,address)"(
    pair: string,
    from: string,
    to: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  primitiveToLpTokens(
    from: string,
    to: string,
    dustRecipient: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "primitiveToLpTokens(address,address,address)"(
    from: string,
    to: string,
    dustRecipient: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  refundDust(
    pair: string,
    recipient: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "refundDust(address,address)"(
    pair: string,
    recipient: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  removeLiquidity(
    pair: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "removeLiquidity(address)"(
    pair: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  router(overrides?: CallOverrides): Promise<string>;

  "router()"(overrides?: CallOverrides): Promise<string>;

  supplyLiquidity(
    token0: string,
    token1: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "supplyLiquidity(address,address)"(
    token0: string,
    token1: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  swapUniLPTokens(
    from: string,
    to: string,
    dustRecipient: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "swapUniLPTokens(address,address,address)"(
    from: string,
    to: string,
    dustRecipient: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  swapUniswap(
    from: string,
    to: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  "swapUniswap(address,address)"(
    from: string,
    to: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  weth(overrides?: CallOverrides): Promise<string>;

  "weth()"(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    factory(overrides?: CallOverrides): Promise<string>;

    "factory()"(overrides?: CallOverrides): Promise<string>;

    lpTokensToPrimitive(
      from: string,
      to: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    "lpTokensToPrimitive(address,address)"(
      from: string,
      to: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    optimalOneSideSupply(
      pair: string,
      from: string,
      to: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    "optimalOneSideSupply(address,address,address)"(
      pair: string,
      from: string,
      to: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    primitiveToLpTokens(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    "primitiveToLpTokens(address,address,address)"(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    refundDust(
      pair: string,
      recipient: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    "refundDust(address,address)"(
      pair: string,
      recipient: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    removeLiquidity(pair: string, overrides?: CallOverrides): Promise<void>;

    "removeLiquidity(address)"(
      pair: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    router(overrides?: CallOverrides): Promise<string>;

    "router()"(overrides?: CallOverrides): Promise<string>;

    supplyLiquidity(
      token0: string,
      token1: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    "supplyLiquidity(address,address)"(
      token0: string,
      token1: string,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    swapUniLPTokens(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    "swapUniLPTokens(address,address,address)"(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    swapUniswap(
      from: string,
      to: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    "swapUniswap(address,address)"(
      from: string,
      to: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    weth(overrides?: CallOverrides): Promise<string>;

    "weth()"(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    factory(overrides?: CallOverrides): Promise<BigNumber>;

    "factory()"(overrides?: CallOverrides): Promise<BigNumber>;

    lpTokensToPrimitive(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "lpTokensToPrimitive(address,address)"(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    optimalOneSideSupply(
      pair: string,
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "optimalOneSideSupply(address,address,address)"(
      pair: string,
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    primitiveToLpTokens(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "primitiveToLpTokens(address,address,address)"(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    refundDust(
      pair: string,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "refundDust(address,address)"(
      pair: string,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    removeLiquidity(
      pair: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "removeLiquidity(address)"(
      pair: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    router(overrides?: CallOverrides): Promise<BigNumber>;

    "router()"(overrides?: CallOverrides): Promise<BigNumber>;

    supplyLiquidity(
      token0: string,
      token1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "supplyLiquidity(address,address)"(
      token0: string,
      token1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    swapUniLPTokens(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "swapUniLPTokens(address,address,address)"(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    swapUniswap(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    "swapUniswap(address,address)"(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    weth(overrides?: CallOverrides): Promise<BigNumber>;

    "weth()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    factory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "factory()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    lpTokensToPrimitive(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "lpTokensToPrimitive(address,address)"(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    optimalOneSideSupply(
      pair: string,
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "optimalOneSideSupply(address,address,address)"(
      pair: string,
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    primitiveToLpTokens(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "primitiveToLpTokens(address,address,address)"(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    refundDust(
      pair: string,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "refundDust(address,address)"(
      pair: string,
      recipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    removeLiquidity(
      pair: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "removeLiquidity(address)"(
      pair: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    router(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "router()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    supplyLiquidity(
      token0: string,
      token1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "supplyLiquidity(address,address)"(
      token0: string,
      token1: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    swapUniLPTokens(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "swapUniLPTokens(address,address,address)"(
      from: string,
      to: string,
      dustRecipient: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    swapUniswap(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    "swapUniswap(address,address)"(
      from: string,
      to: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    weth(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "weth()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
