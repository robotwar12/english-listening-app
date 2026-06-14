declare module "next-pwa" {
  import type { NextConfig } from "next";

  type ExcludeRoute = (input: string) => boolean;
  type RuntimeCaching = Record<string, unknown>;

  interface FallbackRoutes {
    document?: string;
    image?: string;
    audio?: string;
    video?: string;
    font?: string;
  }

  interface PWAConfig {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: RuntimeCaching[];
    publicExcludes?: string[];
    buildExcludes?: Array<string | RegExp | ExcludeRoute>;
    cacheStartUrl?: boolean;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    fallbacks?: FallbackRoutes;
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    customWorkerDir?: string;
    [key: string]: unknown;
  }

  type WithPWA = (config: NextConfig) => NextConfig;

  function nextPWA(config: PWAConfig): WithPWA;

  export = nextPWA;
}