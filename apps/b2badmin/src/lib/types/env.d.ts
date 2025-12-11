export {};

declare global {
  // biome-ignore lint/style/noNamespace: <必须这样>
  declare namespace NodeJS {
    export interface ProcessEnv {
      SECRET: string;
      NEXT_PUBLIC_URL: string;
      DATABASE_URL: string;
    }
  }
}
