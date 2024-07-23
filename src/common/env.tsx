// src/common/utils.tsx

let cachedUrl: string | null = null;

export function GetRestUrl() {
  if (cachedUrl !== null) {
    return cachedUrl;
  }

  const url = process.env["REST_URL"] || process.env["NEXT_PUBLIC_REST_URL"];

  if (!url) {
    throw new Error("REST_URL environment variable is not defined or is an empty string.");
  }

  cachedUrl = url;

  return url;
}

let logoUrl: string | null = null;

export function GetLogoUrl() {
  if (logoUrl !== null) {
    return logoUrl;
  }

  const url = process.env["LOGO_URL"] || process.env["NEXT_PUBLIC_LOGO_URL"];

  if (!url) {
    throw new Error("LOGO_URL environment variable is not defined or is an empty string.");
  }

  logoUrl = url;

  return url;
}

export function GetInfoNetwork() {
  const network = process.env["INFO_NETWORK"] || process.env["NEXT_PUBLIC_INFO_NETWORK"];
  if (!network) {
    throw new Error("INFO_NETWORK environment variable is not defined or is an empty string.");
  }
  return network;
}

export function GetPageTitle() {
  const network = GetInfoNetwork();
  const capitalizedNetwork = network.charAt(0).toUpperCase() + network.slice(1);
  return network === "" ? "Lava Info" : `Lava Info | ${capitalizedNetwork}`;
}

export function GetAxiosCacheTimeout(): number {
  const timeout = process.env["AXIOS_CACHE_TIMEOUT"] || process.env["NEXT_PUBLIC_AXIOS_CACHE_TIMEOUT"];
  if (!timeout) {
    return 20000;
  }
  return parseInt(timeout, 10);
}

export function GetAxiosCacheTTL(): number {
  const timeout = process.env["AXIOS_CACHE_TTL"] || process.env["NEXT_PUBLIC_AXIOS_CACHE_TTL"];
  if (!timeout) {
    return 30
  }
  return parseInt(timeout, 10);
}

export function GetAxiosRetryCount(): number {
  const timeout = process.env["AXIOS_RETRY_COUNT"] || process.env["NEXT_PUBLIC_RETRY_COUNT"];
  if (!timeout) {
    return 3
  }
  return parseInt(timeout, 10);
}
