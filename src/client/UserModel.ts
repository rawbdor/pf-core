import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { Provider as MulticallProvider, Contract as MulticallContract} from 'ethers-multicall';
import { BigNumber } from "@ethersproject/bignumber";
import { ChainNetwork, Chains, PickleModelJson } from "..";
import { getUserJarSummary, IUserEarningsSummary } from "./UserEarnings";
import { JAR_DEFINITIONS } from '../model/JarsAndFarms';
import erc20Abi from '../Contracts/ABIs/erc20.json';
import gaugeAbi from '../Contracts/ABIs/gauge.json';
import gaugeProxyAbi from '../Contracts/ABIs/gauge-proxy.json';
import minichefAbi from '../Contracts/ABIs/minichef.json';
import { AssetEnablement, JarDefinition } from '../model/PickleModelJson';
import { ADDRESSES } from '../model/PickleModel';
import { Contract } from '@ethersproject/contracts';

export interface UserTokenData {
    assetKey: string,
    depositTokenBalance: string,
    pAssetBalance: string,
    pStakedBalance: string,
    picklePending: string,
}
export interface UserData {
    tokens: UserTokenData[],
    earnings: IUserEarningsSummary,
    votes: IUserVote[]
}
export interface IUserVote {
    farmDepositToken: string,
    weight: string,
}
export class UserModel {
    model: PickleModelJson.PickleModelJson;
    walletId: string;
    constructor(model: PickleModelJson.PickleModelJson, walletId: string, rpcs: Map<ChainNetwork, Provider | Signer>) {
        this.model = model;
        this.walletId = walletId;
        Chains.globalInitialize(rpcs);
    }

    async generateUserModel(): Promise<UserData> {
        const [tokens, earnings,votes] = await Promise.all([
            this.getUserTokens(),
            this.getUserEarningsSummary(),
            this.getUserGaugeVotes(),
        ]);
        return {
            tokens: tokens,
            earnings: earnings,
            votes: votes,
        }
    }

    async getUserTokens(): Promise<UserTokenData[]> {
        const ret : UserTokenData[] = [];
        const result = await Promise.all(Chains.list().map((x)=>this.getUserTokensSingleChain(x)));
        for( let i = 0; i < result.length; i++ ) {
            ret.push(...result[i]);
        }
        return ret;
    }

    isErc20Underlying(asset: JarDefinition) {
        return asset.depositToken.style === undefined || 
            asset.depositToken.style.erc20 === true;
    }

    async getUserTokensSingleChain(chain: ChainNetwork) : Promise<UserTokenData[]> {
        const ret = [];
        const chainAssets = JAR_DEFINITIONS.filter((x)=>x.chain===chain 
            && x.enablement !== AssetEnablement.PERMANENTLY_DISABLED
            && this.isErc20Underlying(x));
        
        const provider : MulticallProvider = this.multicallProviderFor(chain);
        const depositTokenBalancesPromise : Promise<BigNumber[]> = provider.all(
            chainAssets.map((x)=>{
                const mcContract = new MulticallContract(x.depositToken.addr, erc20Abi);
                return mcContract.balanceOf(this.walletId);
            })
        );

        const provider2 : MulticallProvider = this.multicallProviderFor(chain);
        const pTokenBalancesPromise : Promise<BigNumber[]> = provider2.all(
            chainAssets.map((x)=>{
                const mcContract = new MulticallContract(x.contract, erc20Abi);
                return mcContract.balanceOf(this.walletId);
            })
        );

        let stakedInFarmPromise : Promise<BigNumber[]> = undefined;
        let picklePendingPromise : Promise<BigNumber[]> = undefined;
        if( chain === ChainNetwork.Ethereum) {
            stakedInFarmPromise = this.getStakedInFarmEth(chain, chainAssets);
            picklePendingPromise = this.getPicklePendingEth(chain, chainAssets);
        } else {
            const chef = ADDRESSES.get(chain).minichef;
            const poolLengthBN : BigNumber = await (new Contract(chef, minichefAbi, this.providerFor(chain))).poolLength();
            const poolLength = parseFloat(poolLengthBN.toString());
            const poolIds: number[] = Array.from(Array(poolLength).keys());
            const multicallProvider = new MulticallProvider(this.providerFor(chain));
            await multicallProvider.init();    
            const miniChefMulticall : MulticallContract = new MulticallContract(chef, minichefAbi);
            const lpTokens: string[] = await multicallProvider.all(
                poolIds.map((id) => {
                    return miniChefMulticall.lpToken(id);
                })
            );
            const lpLower : string[] = lpTokens.map((x)=>x.toLowerCase());
            stakedInFarmPromise = this.getStakedInFarmMinichef(chain, chainAssets, poolIds, lpLower);
            picklePendingPromise = this.getPicklePendingMinichef(chain, chainAssets, poolIds, lpLower);
        }

        const [depositTokenBalances, pTokenBalances, stakedInFarm, picklePending] 
            = await Promise.all([depositTokenBalancesPromise, pTokenBalancesPromise, stakedInFarmPromise, picklePendingPromise]);

        for( let j = 0; j < chainAssets.length; j++ ) {
            const toAdd ={
                assetKey: chainAssets[j].details.apiKey,
                depositTokenBalance: depositTokenBalances[j]?.toString() ||"0",
                pAssetBalance: pTokenBalances[j]?.toString() || "0",
                pStakedBalance: stakedInFarm[j]?.toString() || "0",
                picklePending: picklePending[j]?.toString() || "0",
            };
            const allZeros : boolean = toAdd.depositTokenBalance === "0" &&
                toAdd.pAssetBalance === "0" &&
                toAdd.pStakedBalance === "0" &&
                toAdd.picklePending === "0";
                
            if( !allZeros )
                ret.push(toAdd);
        }
        return ret;
    }

    async getStakedInFarmEth(chain: ChainNetwork, chainAssets: JarDefinition[]) : Promise<BigNumber[]> {
        const filteredChainAssets = chainAssets.filter((x)=>x.farm && x.farm.farmAddress);
        const provider : MulticallProvider = this.multicallProviderFor(chain);
        const stakedBalances : BigNumber[] = await provider.all(
            filteredChainAssets.map((x)=>{
                const mcContract = new MulticallContract(x.farm.farmAddress, gaugeAbi);
                return mcContract.balanceOf(this.walletId);
            })
        );

        // return an array with the same indexes as in the input jar
        // since we filtered them, they don't exactly match up right now
        return this.normalizeIndexes(chainAssets, filteredChainAssets, stakedBalances, BigNumber.from(0));
    }

    async getStakedInFarmMinichef(chain: ChainNetwork, chainAssets: JarDefinition[],
        poolIds: number[], lpLower: string[]) : Promise<BigNumber[]> {
        const chef = ADDRESSES.get(chain).minichef;
        const multicallProvider = new MulticallProvider(this.providerFor(chain));
        await multicallProvider.init();    
        const miniChefMulticall : MulticallContract = new MulticallContract(chef, minichefAbi);

        const userInfos: any[] = await multicallProvider.all(
            poolIds.map((id) => {
            return miniChefMulticall.userInfo(id, this.walletId);
            })
        );
        const ret : BigNumber[] = [];
        for( let i = 0; i < chainAssets.length; i++ ) {
            const ind : number = lpLower.indexOf(chainAssets[i].contract.toLowerCase());
            if( ind === -1 ) {
                ret.push(BigNumber.from(0));
            } else {
                ret.push(userInfos[ind][1].toString());
            }
        }
        return ret;
    }

    async getPicklePendingEth(chain: ChainNetwork, chainAssets: JarDefinition[]) : Promise<BigNumber[]> {
        const filteredChainAssets = chainAssets.filter((x)=>x.farm && x.farm.farmAddress);
        const provider : MulticallProvider = this.multicallProviderFor(chain);
        const pending : BigNumber[] = await provider.all(
            filteredChainAssets.map((x)=>{
                const mcContract = new MulticallContract(x.farm.farmAddress, gaugeAbi);
                return mcContract.earned(this.walletId);
            })
        );

        // return an array with the same indexes as in the input jar
        // since we filtered them, they don't exactly match up right now
        return this.normalizeIndexes(chainAssets, filteredChainAssets, pending, BigNumber.from(0));
 
    }

    async getPicklePendingMinichef(chain: ChainNetwork, chainAssets: JarDefinition[],
        poolIds: number[], lpLower: string[]) : Promise<BigNumber[]> {
        const chef = ADDRESSES.get(chain).minichef;
        const multicallProvider = new MulticallProvider(this.providerFor(chain));
        await multicallProvider.init();    
        const miniChefMulticall : MulticallContract = new MulticallContract(chef, minichefAbi);
        const picklePending: BigNumber[] = await multicallProvider.all(
            poolIds.map((id) => {
            return miniChefMulticall.pendingPickle(id, this.walletId);
            })
        );
        const ret : BigNumber[] = [];
        for( let i = 0; i < chainAssets.length; i++ ) {
            const ind : number = lpLower.indexOf(chainAssets[i].contract.toLowerCase());
            if( ind === -1 ) {
                ret.push(BigNumber.from(0));
            } else {
                ret.push(picklePending[ind]);
            }
        }
        return ret;
    }

    async getUserGaugeVotes(): Promise<IUserVote[]> {
        const gaugeProxy = ADDRESSES.get(ChainNetwork.Ethereum).gaugeProxy;
        const gaugeProxyContract = new Contract(gaugeProxy, gaugeProxyAbi, this.providerFor(ChainNetwork.Ethereum));
        const eligibleTokens : string[] = await gaugeProxyContract.tokens();
        const provider : MulticallProvider = this.multicallProviderFor(ChainNetwork.Ethereum);
        const gaugeProxyMC = new MulticallContract(gaugeProxy, gaugeProxyAbi);
        const userVotes : BigNumber[] = await provider.all(
            eligibleTokens.map((x)=>{
                return gaugeProxyMC.votes(this.walletId, x);
            })
        );
        const ret: IUserVote[] = [];
        for( let i = 0; i < userVotes.length; i++ ) {
            const voteString = userVotes[i].toString();
            if( voteString !== BigNumber.from(0).toString())
                ret.push({farmDepositToken: eligibleTokens[i], weight: voteString})
        }
        return ret;
    }


    async getUserEarningsSummary(): Promise<IUserEarningsSummary> {
        return getUserJarSummary(this.walletId.toLowerCase(), this.model);
    }

    normalizeIndexes(original: JarDefinition[], filtered: JarDefinition[], results: any[], def: any) : any[] {
        let destIndex = 0;
        const retval = [];
        for( let sourceIndex = 0; sourceIndex < original.length; sourceIndex++ ) {
            if(original[sourceIndex] === filtered[destIndex]) {
                retval.push(results[destIndex]);
                destIndex++;
            } else {
                retval.push(def);
            }
        }
        return retval;
    }

    providerFor(network: ChainNetwork) : Provider {
        return Chains.get(network).getPreferredWeb3Provider();
    }
    multicallProviderFor(chain: ChainNetwork) : MulticallProvider {
        return new MulticallProvider(this.providerFor(chain), Chains.get(chain).id);
    }

}

