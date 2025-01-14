/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { Instabrine } from "../Instabrine";

export class Instabrine__factory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): Instabrine {
    return new Contract(address, _abi, signerOrProvider) as Instabrine;
  }
}

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pickleJar",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "curveLp",
        type: "address",
      },
      {
        internalType: "address",
        name: "curve",
        type: "address",
      },
      {
        internalType: "int128",
        name: "index",
        type: "int128",
      },
      {
        internalType: "address",
        name: "underlying",
        type: "address",
      },
    ],
    name: "curvePickleJarToPrimitive_1",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pickleJar",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "curveLp",
        type: "address",
      },
      {
        internalType: "address",
        name: "curve",
        type: "address",
      },
      {
        internalType: "address[2]",
        name: "underlying",
        type: "address[2]",
      },
    ],
    name: "curvePickleJarToPrimitive_2",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pickleJar",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "curveLp",
        type: "address",
      },
      {
        internalType: "address",
        name: "curve",
        type: "address",
      },
      {
        internalType: "address[3]",
        name: "underlying",
        type: "address[3]",
      },
    ],
    name: "curvePickleJarToPrimitive_3",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pickleJar",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "curveLp",
        type: "address",
      },
      {
        internalType: "address",
        name: "curve",
        type: "address",
      },
      {
        internalType: "address[4]",
        name: "underlying",
        type: "address[4]",
      },
    ],
    name: "curvePickleJarToPrimitive_4",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "emergencyERC20Retrieve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "jar",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "underlying",
        type: "address",
      },
    ],
    name: "pickleJarToPrimitive",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "curve",
        type: "address",
      },
      {
        internalType: "address[2]",
        name: "underlying",
        type: "address[2]",
      },
      {
        internalType: "uint256[2]",
        name: "underlyingAmounts",
        type: "uint256[2]",
      },
      {
        internalType: "address",
        name: "curveLp",
        type: "address",
      },
      {
        internalType: "address",
        name: "pickleJar",
        type: "address",
      },
    ],
    name: "primitiveToCurvePickleJar_2",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "curve",
        type: "address",
      },
      {
        internalType: "address[3]",
        name: "underlying",
        type: "address[3]",
      },
      {
        internalType: "uint256[3]",
        name: "underlyingAmounts",
        type: "uint256[3]",
      },
      {
        internalType: "address",
        name: "curveLp",
        type: "address",
      },
      {
        internalType: "address",
        name: "pickleJar",
        type: "address",
      },
    ],
    name: "primitiveToCurvePickleJar_3",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "curve",
        type: "address",
      },
      {
        internalType: "address[4]",
        name: "underlying",
        type: "address[4]",
      },
      {
        internalType: "uint256[4]",
        name: "underlyingAmounts",
        type: "uint256[4]",
      },
      {
        internalType: "address",
        name: "curveLp",
        type: "address",
      },
      {
        internalType: "address",
        name: "pickleJar",
        type: "address",
      },
    ],
    name: "primitiveToCurvePickleJar_4",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "underlying",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "jar",
        type: "address",
      },
    ],
    name: "primitiveToPickleJar",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];
