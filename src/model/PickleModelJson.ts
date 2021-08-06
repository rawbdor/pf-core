import { Chain } from "../chain/ChainModel";
import { ActiveJarHarvestStats, JarHarvestStats } from "../harvest/JarHarvestResolver";

// TODO move these out i guess?
export const PROTOCOL_TYPE_UNISWAP = "uniswap";
export const PROTOCOL_TYPE_SUSHISWAP = "sushiswap";
export const PROTOCOL_TYPE_SUSHISWAP_POLYGON = "sushiswap_polygon";
export const PROTOCOL_TYPE_COMETHSWAP = "comethswap";
export const PROTOCOL_TYPE_QUICKSWAP_POLYGON = "quickswap_polygon";
export const PROTOCOL_TYPE_AAVE_POLYGON = "aave_polygon";
export const PROTOCOL_TYPE_YEARN = "yearn";
export const PROTOCOL_TYPE_SADDLE = "saddle";
export const PROTOCOL_TYPE_CURVE = "curve";
export const PROTOCOL_TYPE_COMPOUND = "compound";
export const PROTOCOL_TYPE_TOKENPRICE = "tokenprice"


export enum AssetEnablement {
    DISABLED = 1,
    PERMANENTLY_DISABLED,
    ENABLED,
    DEV
}


export enum HarvestStyle {
    ACTIVE = 1,
    PASSIVE = 2
}

export interface DepositToken {
    addr: string,
    name: string,
    link: string,
    components?: string[]
}

export interface JarDefinition {
    id: string,
    contract: string,
    depositToken: DepositToken,
    enablement: AssetEnablement,
    chain: Chain,
    protocol: string,
    details: JarDetails,
    farm: NestedFarmDetails,
}
export interface StandaloneFarmDefinition {
    id: string,
    farmNickname: string,
    contract: string,
    depositToken: DepositToken,
    enablement: AssetEnablement,
    chain: Chain,
    protocol: string,
    details?: FarmDetails,
}
export interface JarDetails {
    apiKey: string,
    harvestStyle: HarvestStyle
    strategyName?: string,
    strategyAddr?: string,
    ratio?: number,
    harvestStats?: JarHarvestStats | ActiveJarHarvestStats,
    oneDayApy?: number,
    threeDayApy?: number,
    sevenDayApy?: number,
    thirtyDayApy?: number,
}

export interface FarmDetails {
    allocShare?: number,
    tokenBalance?: number,
    valueBalance?: number,
    picklePerBlock?: number,
    picklePerDay?: number,
    oneDayApy?: number,
    threeDayApy?: number,
    sevenDayApy?: number,
    thirtyDayApy?: number,
}

export interface NestedFarmDetails {
    farmAddress: string,
    farmDepositTokenName: string,
    farmNickname: string,
    details?: FarmDetails,
}

export interface DillDetails {
    pickleLocked: number;
    totalDill: number;
    dillWeeks: DillWeek[]
}

export interface DillWeek {
    weeklyPickleAmount : number,
    totalPickleAmount : number,
    weeklyDillAmount : number,
    totalDillAmount : number,
    pickleDillRatio : number,
    picklePriceUsd : number,
    isProjected: boolean,
    distributionTime: Date
}

export interface PickleModelJson {
    jarsAndFarms: {
        jars: JarDefinition[],
        standaloneFarms: StandaloneFarmDefinition[],
    },
    dill: DillDetails,
    prices: any
}