// DataCommons API Configuration
// Handles API keys, headers, and request parameters for DataCommons integration

export const DATACOMMONS_CONFIG = {
  baseUrl: process.env.DATACOMMONS_BASE_URL || "https://api.datacommons.org/v2",
  fallbackBaseUrl: process.env.DATACOMMONS_FALLBACK_URL || "https://api.datacommons.org/v1",
  nlBaseUrl: process.env.DATACOMMONS_NL_URL || "https://nl.datacommons.org/nodejs/query",
  apiKey: process.env.DATACOMMONS_API_KEY,
  apiSecret: process.env.DATACOMMONS_API_SECRET,
};

export function getDataCommonsHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "User-Agent": "GovQuery-Frontend/1.0.0",
  };

  // Add API key if available
  if (DATACOMMONS_CONFIG.apiKey) {
    headers["X-API-Key"] = DATACOMMONS_CONFIG.apiKey;
  }

  // Add API secret if available
  if (DATACOMMONS_CONFIG.apiSecret) {
    headers["X-API-Secret"] = DATACOMMONS_CONFIG.apiSecret;
  }

  return headers;
}

export function getDataCommonsQueryParams(): Record<string, string> {
  const params: Record<string, string> = {};

  // Add API key to query params if not in headers
  if (DATACOMMONS_CONFIG.apiKey && !process.env.DATACOMMONS_API_KEY_IN_HEADER) {
    params["key"] = DATACOMMONS_CONFIG.apiKey;
  }

  return params;
}

export function getDataCommonsNLHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "User-Agent": "GovQuery-Frontend/1.0.0",
  };

  // Add API key if available
  if (DATACOMMONS_CONFIG.apiKey) {
    headers["X-API-Key"] = DATACOMMONS_CONFIG.apiKey;
  }

  return headers;
}
