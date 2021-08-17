import { BigNumber, ethers, Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { sorbettiereAbi } from '../Contracts/ABIs/sorbettiere.abi';
import { JarDefinition } from '../model/PickleModelJson';
import { PriceCache } from '../price/PriceCache';
import { AbstractJarHarvestResolver } from './JarHarvestResolver';

export class SpellEth extends AbstractJarHarvestResolver {
  async getHarvestableUSD( jar: JarDefinition, prices: PriceCache, resolver: Signer | Provider): Promise<number> {
    const sorbettiere = new ethers.Contract(
      '0xf43480afe9863da4acbd4419a47d9cc7d25a647f',
      sorbettiereAbi,
      resolver,
    );
    const [spell, spellPrice] = await Promise.all([
      sorbettiere.pendingIce(0, jar.details.strategyAddr),
      this.priceOf(prices, 'spell-token'),
    ]);

    const harvestable = spell.mul(BigNumber.from((spellPrice * 1e18).toFixed())).div((1e18).toFixed());
    return parseFloat(ethers.utils.formatEther(harvestable));
  }
}