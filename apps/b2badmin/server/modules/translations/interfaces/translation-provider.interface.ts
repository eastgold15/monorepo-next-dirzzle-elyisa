export interface TranslateProvider {
  readonly name: string;
  translate(text: string, from: string, to: string): Promise<string>;
  batchTranslate(texts: string[], from: string, to: string): Promise<string[]>;
}
