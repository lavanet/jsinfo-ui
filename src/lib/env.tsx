// src/common/utils.tsx

const envCache: Record<string, string> = {};

const envVars = {
  REST_URL: process.env.REST_URL,
  LOGO_URL: process.env.LOGO_URL,
  INFO_NETWORK: process.env.INFO_NETWORK,
  AXIOS_CACHE_TIMEOUT: process.env.AXIOS_CACHE_TIMEOUT,
  AXIOS_CACHE_TTL: process.env.AXIOS_CACHE_TTL,
  AXIOS_RETRY_COUNT: process.env.AXIOS_RETRY_COUNT,
  NEXT_PUBLIC_REST_URL: process.env.NEXT_PUBLIC_REST_URL,
  NEXT_PUBLIC_LOGO_URL: process.env.NEXT_PUBLIC_LOGO_URL,
  NEXT_PUBLIC_INFO_NETWORK: process.env.NEXT_PUBLIC_INFO_NETWORK,
  NEXT_PUBLIC_AXIOS_CACHE_TIMEOUT:
    process.env.NEXT_PUBLIC_AXIOS_CACHE_TIMEOUT,
  NEXT_PUBLIC_AXIOS_CACHE_TTL: process.env.NEXT_PUBLIC_AXIOS_CACHE_TTL,
  NEXT_PUBLIC_AXIOS_RETRY_COUNT: process.env.NEXT_PUBLIC_AXIOS_RETRY_COUNT,
  REST_LOGPUSH_URL: process.env.REST_LOGPUSH_URL,
  NEXT_PUBLIC_REST_LOGPUSH_URL: process.env.NEXT_PUBLIC_REST_LOGPUSH_URL,
}

export function GetEnvVariable(primary: string, defaultValue: string | null = null): string {

  if (envCache[primary]) {
    return envCache[primary];
  }

  let normalizedPrimary = primary.toLowerCase().trim();

  for (const [key, val] of Object.entries(envVars)) {
    let normalizedKey = key.toLowerCase().trim();
    normalizedKey = normalizedKey.replace('next_public_', '');
    if (normalizedKey === normalizedPrimary && val) {
      envCache[primary] = val;
      return val;
    }
  }

  if (defaultValue !== null) {
    envCache[primary] = defaultValue;
    return defaultValue;
  }

  throw new Error(`${primary} environment variable is not defined and has no default value.`);
}

export function GetExplorersGuruUrl() {
  const network = GetInfoNetwork().toLowerCase().trim();
  return network.includes("mainnet") ? "https://lava.explorers.guru" : "https://testnet.lava.explorers.guru";
}

export function GetJsinfobeUrl() {
  return GetEnvVariable("REST_URL");
}

export function GetLogoUrl() {
  return "https://gateway-fe-public-assets.s3.us-east-1.amazonaws.com/env/LavaOnly.svg";
  return GetEnvVariable("LOGO_URL");
}

export function GetInfoNetwork() {
  return GetEnvVariable("INFO_NETWORK");
}

export function GetPageTitle() {
  const network = GetInfoNetwork();
  const capitalizedNetwork = network.charAt(0).toUpperCase() + network.slice(1);
  return network === "" ? "Lava Info" : `Lava Info | ${capitalizedNetwork}`;
}

export function GetAxiosCacheTimeout(): number {
  return parseInt(GetEnvVariable("AXIOS_CACHE_TIMEOUT", "30000"), 10); // 30 seconds
}

export function GetAxiosCacheTTL(): number {
  return parseInt(GetEnvVariable("AXIOS_CACHE_TTL", "10"), 10); // 10 seconds
}

export function GetAxiosRetryCount(): number {
  return parseInt(GetEnvVariable("AXIOS_RETRY_COUNT", "3"), 10);
}

export function GetLogpushUrl(): string {
  return GetEnvVariable("REST_LOGPUSH_URL", "https://cf-logpush.lavapro.xyz");
}