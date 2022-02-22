import { documentationAssetDefinitionToResult } from "./docModel/documentationImplementation";
import { ALL_ASSETS } from "./model/JarsAndFarms";
import { DocsFormat } from ".";
import { getAllJarDocumentationDefinitions } from "./docModel/DocsManager";

function getDocs(language: string) {
  const docs = [];
  const allDefs = getAllJarDocumentationDefinitions();
  for (let i = 0; i < allDefs.length; i++) {
    docs.push(
      documentationAssetDefinitionToResult(
        language,
        DocsFormat.HTML,
        allDefs[i],
      ),
    );
  }

  for (let i = 0; i < ALL_ASSETS.length; i++) {
    const apiKey = ALL_ASSETS[i]?.details?.apiKey;
    if (apiKey !== undefined) {
      const foundDocs = allDefs.find((x) => x.apiKey.toLowerCase() === apiKey.toLowerCase());
      if (foundDocs === undefined) {
        console.log("Docs missing for asset " + apiKey);
      }
    }
  }
  return docs;
}

console.log(JSON.stringify(getDocs("en"), null, 2));
// console.log(JSON.stringify(getDocs("de"), null, 2));
