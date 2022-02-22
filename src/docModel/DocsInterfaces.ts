export const SOCIAL_KEY_DISCORD = "social.key.discord";
export const SOCIAL_KEY_TELEGRAM = "social.key.telegram";
export const SOCIAL_KEY_TWITTER = "social.key.twitter";

export const OBTAIN_KEY_ONETOKEN_POOL = "obtain.pool.onetoken";
export const OBTAIN_KEY_TWOTOKEN_POOL = "obtain.pool.twotoken";
export const OBTAIN_KEY_MULTITOKEN_POOL = "obtain.pool.multitoken";
export const OBTAIN_KEY_ZAPPER = "obtain.pool.zapper";

export const RISK_SMART_CONTRACT = "risk.smart.contract";
export const RISK_MAINTAIN_PEG = "risk.maintain.peg";
export const RISK_PROTOCOL = "risk.protocol";

export interface DocumentationModelDefinition {
  [key: string]: AssetDocumentationDefinition;
}

export interface AssetDocumentationDefinition {
  apiKey: string;
  // Defaults to apiKey + ".desc"
  descriptionKey?: string;
  social?: TranslationKeyWithProperties[];
  obtain: TranslationKeyWithProperties[];
  risks: TranslationKeyWithProperties[];
}

export interface TranslationKeyWithProperties {
  key: string;
  properties?: { [key: string]: string };
}
export interface DocumentationModelResult {
  [key: string]: AssetDocumentationResult;
}

export interface AssetDocumentationResult {
  // Defaults to apiKey + ".desc"
  apiKey: string;
  description: string;
  social?: string[];
  obtain: string[];
  risks: string[];
}

export enum DocsFormat {
  HTML = "html",
  MD = "markdown",
  PLAIN = "plain",
}
