import { AbstractPriceResolver } from "./AbstractPriceResolver";
import { IPriceResolver } from "./IPriceResolver";
import fetch from "cross-fetch";

export class CoinMarketCapPriceResolver extends AbstractPriceResolver implements IPriceResolver{
    protected async fetchPricesBySearchId(searchNames: string[]): Promise<Map<string, number>> {
      const joined = searchNames.join(",");
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=2ba4867e-b50f-44d7-806d-c0c5fde1a8db&slug=" + joined;
      const res = await fetch(url).then((x) => x.json());
      const data = res.data;
      const ret = new Map<string,number>();
      for( let i = 0; i < searchNames.length; i++ ) {
          const keys = Object.keys(data);
          const found = keys.find((x)=>data[x].name === searchNames[i] || data[x].slug === searchNames[i]);
          if( found ) {
              const price = data[found]?.quote?.USD?.price;
              if( price )
                  ret.set(searchNames[i], price);
          }
      }
      return ret;
    }

    protected async fetchPricesByContracts(_contractIds: string[]): Promise<Map<string, number>> {
        // We'll only search by actual names here.
        return new Map<string,number>();
    }
}