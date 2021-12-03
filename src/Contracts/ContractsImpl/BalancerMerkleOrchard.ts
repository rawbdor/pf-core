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
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export interface BalancerMerkleOrchardInterface extends ethers.utils.Interface {
  functions: {
    "claimDistributions(address,tuple[],address[])": FunctionFragment;
    "claimDistributionsToInternalBalance(address,tuple[],address[])": FunctionFragment;
    "claimDistributionsWithCallback(address,tuple[],address[],address,bytes)": FunctionFragment;
    "createDistribution(address,bytes32,uint256,uint256)": FunctionFragment;
    "getDistributionRoot(address,address,uint256)": FunctionFragment;
    "getNextDistributionId(address,address)": FunctionFragment;
    "getRemainingBalance(address,address)": FunctionFragment;
    "getVault()": FunctionFragment;
    "isClaimed(address,address,uint256,address)": FunctionFragment;
    "verifyClaim(address,address,uint256,address,uint256,bytes32[])": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "claimDistributions",
    values: [
      string,
      {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      string[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "claimDistributionsToInternalBalance",
    values: [
      string,
      {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      string[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "claimDistributionsWithCallback",
    values: [
      string,
      {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      string[],
      string,
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "createDistribution",
    values: [string, BytesLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getDistributionRoot",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getNextDistributionId",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getRemainingBalance",
    values: [string, string]
  ): string;
  encodeFunctionData(functionFragment: "getVault", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "isClaimed",
    values: [string, string, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyClaim",
    values: [string, string, BigNumberish, string, BigNumberish, BytesLike[]]
  ): string;

  decodeFunctionResult(
    functionFragment: "claimDistributions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimDistributionsToInternalBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimDistributionsWithCallback",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createDistribution",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDistributionRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getNextDistributionId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRemainingBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getVault", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "isClaimed", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "verifyClaim",
    data: BytesLike
  ): Result;

  events: {
    "DistributionAdded(address,address,uint256,bytes32,uint256)": EventFragment;
    "DistributionClaimed(address,address,uint256,address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "DistributionAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "DistributionClaimed"): EventFragment;
}

export type DistributionAddedEvent = TypedEvent<
  [string, string, BigNumber, string, BigNumber],
  {
    distributor: string;
    token: string;
    distributionId: BigNumber;
    merkleRoot: string;
    amount: BigNumber;
  }
>;

export type DistributionAddedEventFilter =
  TypedEventFilter<DistributionAddedEvent>;

export type DistributionClaimedEvent = TypedEvent<
  [string, string, BigNumber, string, string, BigNumber],
  {
    distributor: string;
    token: string;
    distributionId: BigNumber;
    claimer: string;
    recipient: string;
    amount: BigNumber;
  }
>;

export type DistributionClaimedEventFilter =
  TypedEventFilter<DistributionClaimedEvent>;

export interface BalancerMerkleOrchard extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: BalancerMerkleOrchardInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    claimDistributions(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    claimDistributionsToInternalBalance(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    claimDistributionsWithCallback(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      callbackContract: string,
      callbackData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    createDistribution(
      token: string,
      merkleRoot: BytesLike,
      amount: BigNumberish,
      distributionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getDistributionRoot(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getNextDistributionId(
      token: string,
      distributor: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getRemainingBalance(
      token: string,
      distributor: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getVault(overrides?: CallOverrides): Promise<[string]>;

    isClaimed(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      claimer: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    verifyClaim(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      claimer: string,
      claimedBalance: BigNumberish,
      merkleProof: BytesLike[],
      overrides?: CallOverrides
    ): Promise<[boolean]>;
  };

  claimDistributions(
    claimer: string,
    claims: {
      distributionId: BigNumberish;
      balance: BigNumberish;
      distributor: string;
      tokenIndex: BigNumberish;
      merkleProof: BytesLike[];
    }[],
    tokens: string[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  claimDistributionsToInternalBalance(
    claimer: string,
    claims: {
      distributionId: BigNumberish;
      balance: BigNumberish;
      distributor: string;
      tokenIndex: BigNumberish;
      merkleProof: BytesLike[];
    }[],
    tokens: string[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  claimDistributionsWithCallback(
    claimer: string,
    claims: {
      distributionId: BigNumberish;
      balance: BigNumberish;
      distributor: string;
      tokenIndex: BigNumberish;
      merkleProof: BytesLike[];
    }[],
    tokens: string[],
    callbackContract: string,
    callbackData: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  createDistribution(
    token: string,
    merkleRoot: BytesLike,
    amount: BigNumberish,
    distributionId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getDistributionRoot(
    token: string,
    distributor: string,
    distributionId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  getNextDistributionId(
    token: string,
    distributor: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getRemainingBalance(
    token: string,
    distributor: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getVault(overrides?: CallOverrides): Promise<string>;

  isClaimed(
    token: string,
    distributor: string,
    distributionId: BigNumberish,
    claimer: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  verifyClaim(
    token: string,
    distributor: string,
    distributionId: BigNumberish,
    claimer: string,
    claimedBalance: BigNumberish,
    merkleProof: BytesLike[],
    overrides?: CallOverrides
  ): Promise<boolean>;

  callStatic: {
    claimDistributions(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    claimDistributionsToInternalBalance(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    claimDistributionsWithCallback(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      callbackContract: string,
      callbackData: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    createDistribution(
      token: string,
      merkleRoot: BytesLike,
      amount: BigNumberish,
      distributionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    getDistributionRoot(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    getNextDistributionId(
      token: string,
      distributor: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRemainingBalance(
      token: string,
      distributor: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getVault(overrides?: CallOverrides): Promise<string>;

    isClaimed(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      claimer: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    verifyClaim(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      claimer: string,
      claimedBalance: BigNumberish,
      merkleProof: BytesLike[],
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {
    "DistributionAdded(address,address,uint256,bytes32,uint256)"(
      distributor?: string | null,
      token?: string | null,
      distributionId?: null,
      merkleRoot?: null,
      amount?: null
    ): DistributionAddedEventFilter;
    DistributionAdded(
      distributor?: string | null,
      token?: string | null,
      distributionId?: null,
      merkleRoot?: null,
      amount?: null
    ): DistributionAddedEventFilter;

    "DistributionClaimed(address,address,uint256,address,address,uint256)"(
      distributor?: string | null,
      token?: string | null,
      distributionId?: null,
      claimer?: string | null,
      recipient?: null,
      amount?: null
    ): DistributionClaimedEventFilter;
    DistributionClaimed(
      distributor?: string | null,
      token?: string | null,
      distributionId?: null,
      claimer?: string | null,
      recipient?: null,
      amount?: null
    ): DistributionClaimedEventFilter;
  };

  estimateGas: {
    claimDistributions(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    claimDistributionsToInternalBalance(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    claimDistributionsWithCallback(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      callbackContract: string,
      callbackData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    createDistribution(
      token: string,
      merkleRoot: BytesLike,
      amount: BigNumberish,
      distributionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getDistributionRoot(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getNextDistributionId(
      token: string,
      distributor: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRemainingBalance(
      token: string,
      distributor: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getVault(overrides?: CallOverrides): Promise<BigNumber>;

    isClaimed(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      claimer: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    verifyClaim(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      claimer: string,
      claimedBalance: BigNumberish,
      merkleProof: BytesLike[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    claimDistributions(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    claimDistributionsToInternalBalance(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    claimDistributionsWithCallback(
      claimer: string,
      claims: {
        distributionId: BigNumberish;
        balance: BigNumberish;
        distributor: string;
        tokenIndex: BigNumberish;
        merkleProof: BytesLike[];
      }[],
      tokens: string[],
      callbackContract: string,
      callbackData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    createDistribution(
      token: string,
      merkleRoot: BytesLike,
      amount: BigNumberish,
      distributionId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getDistributionRoot(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getNextDistributionId(
      token: string,
      distributor: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRemainingBalance(
      token: string,
      distributor: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getVault(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isClaimed(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      claimer: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    verifyClaim(
      token: string,
      distributor: string,
      distributionId: BigNumberish,
      claimer: string,
      claimedBalance: BigNumberish,
      merkleProof: BytesLike[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}