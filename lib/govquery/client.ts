// GovQuery API Client
// TypeScript client for communicating with the GovQuery Python backend

import { QueryRequest, QueryResponse, SchemaInfo, HealthResponse, ApiError, GovQueryConfig, SQLParseResult, ExecuteRequest, ExecuteResponse } from "./types";
import { govQueryCache, GovQueryCache } from "./cache";

export class GovQueryClient {
  private config: GovQueryConfig;

  constructor(config?: Partial<GovQueryConfig>) {
    this.config = {
      baseUrl: process.env.GOVQUERY_BACKEND_URL || "/api/govquery",
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      ...config,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Handle relative URLs properly
    const baseUrl = this.config.baseUrl.endsWith('/') 
      ? this.config.baseUrl.slice(0, -1) 
      : this.config.baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') 
      ? endpoint 
      : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
          status_code: response.status,
        }));
        throw new Error(errorData.detail);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout");
        }
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        console.warn(`Request failed, retrying (${attempt}/${this.config.retryAttempts}):`, error);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  async healthCheck(): Promise<HealthResponse> {
    const cacheKey = GovQueryCache.getHealthKey();
    const cached = govQueryCache.get<HealthResponse>(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔍 Health check: Making request to frontend API...');
      // Use the root endpoint for health check
      const result = await this.retryRequest(() => this.makeRequest<HealthResponse>("/"));
      console.log('🔍 Health check: Frontend API response received:', result);
      
      govQueryCache.set(cacheKey, result, 30000); // Cache for 30 seconds
      return result;
    } catch (error) {
      console.error('🔍 Health check: Error occurred:', error);
      // Return unhealthy status on error
      const healthResponse: HealthResponse = {
        status: "unhealthy",
        schemas_loaded: 0,
        modal_app_running: false,
        modal_app_name: "",
        deployment_attempted: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
      
      govQueryCache.set(cacheKey, healthResponse, 5000); // Cache for 5 seconds on error
      return healthResponse;
    }
  }

  async listSchemas(): Promise<SchemaInfo[]> {
    const cacheKey = GovQueryCache.getSchemasKey();
    const cached = govQueryCache.get<SchemaInfo[]>(cacheKey);
    if (cached) return cached;

    const result = await this.retryRequest(() => this.makeRequest<SchemaInfo[]>("/schemas"));
    govQueryCache.set(cacheKey, result, 300000); // Cache for 5 minutes
    return result;
  }

  async getSchema(tableCode: string): Promise<SchemaInfo> {
    const cacheKey = GovQueryCache.getSchemaKey(tableCode);
    const cached = govQueryCache.get<SchemaInfo>(cacheKey);
    if (cached) return cached;

    const result = await this.retryRequest(() => 
      this.makeRequest<SchemaInfo>(`/schema/${encodeURIComponent(tableCode)}`)
    );
    govQueryCache.set(cacheKey, result, 300000); // Cache for 5 minutes
    return result;
  }

  async convertToSQL(request: QueryRequest): Promise<QueryResponse> {
    return this.retryRequest(() =>
      this.makeRequest<QueryResponse>("/", {
        method: "POST",
        body: JSON.stringify(request),
      })
    );
  }

  async convertToSQLSimple(request: QueryRequest): Promise<QueryResponse> {
    return this.retryRequest(() =>
      this.makeRequest<QueryResponse>("/simple", {
        method: "POST",
        body: JSON.stringify(request),
      })
    );
  }

  async deployModalApp(): Promise<{ status: string; message: string; app_name?: string }> {
    return this.retryRequest(() =>
      this.makeRequest<{ status: string; message: string; app_name?: string }>("/deploy", {
        method: "POST",
      })
    );
  }

  async parseSQL(sql: string): Promise<SQLParseResult> {
    return this.retryRequest(() =>
      this.makeRequest<SQLParseResult>("/parse-sql", {
        method: "POST",
        body: JSON.stringify({ sql }),
      })
    );
  }

  async executeSQL(sql: string, maxRows?: number): Promise<ExecuteResponse> {
    const request: ExecuteRequest = {
      sql,
      max_rows: maxRows
    };
    
    return this.retryRequest(() =>
      this.makeRequest<ExecuteResponse>("/execute", {
        method: "POST",
        body: JSON.stringify(request),
      })
    );
  }

  // Utility method to check if backend is available
  async isAvailable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
}

// Export a default instance
export const govQueryClient = new GovQueryClient();
