import { PickleAsset } from "../model/PickleModelJson";
import { CUSTOM_JAR_DOCUMENTATION } from "./docs";
import { AssetDocumentationDefinition, AssetDocumentationResult, DocsFormat, DocumentationModelResult } from "./DocsInterfaces";
import { documentationAssetDefinitionToResult } from "./documentationImplementation";

export const getAllJarDocumentationDefinitions = (): AssetDocumentationDefinition[] => {
  let ret: AssetDocumentationDefinition[] = [];
  ret = ret.concat(CUSTOM_JAR_DOCUMENTATION);
  // TODO add automatic ones
  return ret;
}


export class DocsManager {

  public static getDocumentationForAllAssets(
    language: string,
    linkType: DocsFormat,
  ): DocumentationModelResult {
    const result: DocumentationModelResult = {};
    const allDefs: AssetDocumentationDefinition[] = getAllJarDocumentationDefinitions();
    for (let i = 0; i < allDefs.length; i++) {
      const d = DocsManager.getDocumentationForAssetId(
        allDefs[i].apiKey,
        language,
        linkType,
      );
      result[allDefs[i].apiKey] = d;
    }
    return result;
  }

  public static getDocumentationForAsset(
    asset: PickleAsset,
    language: string,
    linkType: DocsFormat,
  ): AssetDocumentationResult {
    return DocsManager.getDocumentationForAssetId(
      asset.details.apiKey,
      language,
      linkType,
    );
  }
  public static getDocumentationForAssetId(
    assetId: string,
    language: string,
    linkType: DocsFormat,
  ): AssetDocumentationResult {
    const docItem: AssetDocumentationDefinition | undefined =
      getAllJarDocumentationDefinitions().find(
        (x) => x.apiKey.toLowerCase() === assetId.toLowerCase(),
      );
    if (!docItem) {
      return undefined;
    }
    return documentationAssetDefinitionToResult(language, linkType, docItem);
  }

  public static getAssetDocumentationString(
    docs: AssetDocumentationResult,
    format: DocsFormat,
  ): string {
    // TODO docbook format, plain text
    let ret = "";
    if (format === DocsFormat.HTML) {
      ret += "<p>" + docs.description + "</p>\n";
      if (docs.social) {
        ret += "<p>Social: ";
        for (let i = 0; i < docs.social.length; i++) {
          ret += docs.social[i] + " - ";
        }
        ret += "</p>\n";
      }
      if (docs.obtain) {
        ret += "<ul>\n";
        for (let i = 0; i < docs.obtain.length; i++) {
          ret += "  <li>" + docs.obtain[i] + "</li>\n";
        }
        ret += "</ul>\n";
      }
      if (docs.risks) {
        ret += "<ul>\n";
        for (let i = 0; i < docs.risks.length; i++) {
          ret += "  <li>" + docs.risks[i] + "</li>\n";
        }
        ret += "</ul>\n";
      }
    }
    return ret;
  }
}
