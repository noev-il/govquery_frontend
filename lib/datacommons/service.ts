// DataCommons Service - Independent data querying service
// This service handles natural language to DataCommons API queries
// Completely separate from the conversational AI

import {
  DATACOMMONS_CONFIG,
  getDataCommonsHeaders,
  getDataCommonsQueryParams,
} from "./config";

export interface DataCommonsQuery {
  query: string;
  limit?: number;
  entityType?:
    | "place"
    | "demographic"
    | "economic"
    | "education"
    | "health"
    | "environment";
}

export interface DataCommonsResult {
  dcid: string;
  name: string;
  type: string;
  description?: string;
  population?: number;
  medianIncome?: number;
  unemploymentRate?: number;
  gdp?: number;
  lifeExpectancy?: number;
  temperature?: number;
  precipitation?: number;
  location?: string;
  [key: string]: any; // Allow additional properties
}

export interface DataCommonsResponse {
  success: boolean;
  query: string;
  results: DataCommonsResult[];
  totalResults: number;
  entityType: string;
  dataSource: string;
  error?: string;
}

export interface DataCommonsNLQuery {
  query: string;
  context?: string;
}

export interface DataCommonsNLResponse {
  success: boolean;
  query: string;
  data?: any;
  source: string;
  mode?: string;
  error?: string;
  fallback?: boolean;
}

class DataCommonsService {
  private baseUrl = DATACOMMONS_CONFIG.baseUrl;

  // Parse query to determine which properties to fetch
  private parseQuery(query: string): {
    properties: string[];
  } {
    const queryLower = query.toLowerCase();
    const properties = ["name", "typeOf", "description"]; // Always include basic properties

    // Add data-specific properties based on query content
    if (queryLower.includes("population")) {
      properties.push("population");
    }
    if (queryLower.includes("income") || queryLower.includes("economic")) {
      properties.push("medianIncome", "gdp");
    }
    if (
      queryLower.includes("unemployment") ||
      queryLower.includes("employment")
    ) {
      properties.push("unemploymentRate");
    }
    if (
      queryLower.includes("health") ||
      queryLower.includes("life expectancy")
    ) {
      properties.push("lifeExpectancy");
    }
    if (queryLower.includes("temperature") || queryLower.includes("weather")) {
      properties.push("temperature", "precipitation");
    }

    return { properties };
  }

  // Get mock data response for demonstration
  private getMockDataResponse(query: DataCommonsQuery): DataCommonsResponse {
    const queryLower = query.query.toLowerCase();
    const results: DataCommonsResult[] = [];

    // California data
    if (queryLower.includes("california") || queryLower.includes("ca")) {
      results.push({
        dcid: "geoId/06",
        name: "California",
        type: "State",
        description: "The most populous state in the United States",
        population: 39_538_223,
        medianIncome: 78_700,
        unemploymentRate: 4.1,
        location: "United States",
      });
    }

    // Texas data
    if (queryLower.includes("texas") || queryLower.includes("tx")) {
      results.push({
        dcid: "geoId/48",
        name: "Texas",
        type: "State",
        description: "The second most populous state in the United States",
        population: 29_145_505,
        medianIncome: 65_000,
        unemploymentRate: 3.8,
        location: "United States",
      });
    }

    // Florida data
    if (queryLower.includes("florida") || queryLower.includes("fl")) {
      results.push({
        dcid: "geoId/12",
        name: "Florida",
        type: "State",
        description: "The third most populous state in the United States",
        population: 21_538_187,
        medianIncome: 58_000,
        unemploymentRate: 3.2,
        location: "United States",
      });
    }

    // Cities data
    if (queryLower.includes("cities") || queryLower.includes("city")) {
      results.push(
        {
          dcid: "geoId/3651000",
          name: "New York City",
          type: "City",
          description: "The most populous city in the United States",
          population: 8_336_817,
          medianIncome: 67_800,
          location: "New York",
        },
        {
          dcid: "geoId/0644000",
          name: "Los Angeles",
          type: "City",
          description: "The second most populous city in the United States",
          population: 3_980_400,
          medianIncome: 65_000,
          location: "California",
        },
        {
          dcid: "geoId/1714000",
          name: "Chicago",
          type: "City",
          description: "The third most populous city in the United States",
          population: 2_746_388,
          medianIncome: 62_000,
          location: "Illinois",
        }
      );
    }

    // Default data if no specific matches
    if (results.length === 0) {
      results.push({
        dcid: "geoId/06",
        name: "California",
        type: "State",
        description: "The most populous state in the United States",
        population: 39_538_223,
        medianIncome: 78_700,
        unemploymentRate: 4.1,
        location: "United States",
      });
    }

    return {
      success: true,
      query: query.query,
      results: results.slice(0, query.limit || 20),
      totalResults: results.length,
      entityType: query.entityType || "general",
      dataSource: "DataCommons (Mock Data - API Key Required)",
    };
  }

  // Process search results and get detailed data
  private async processSearchResults(
    searchData: any,
    query: DataCommonsQuery,
    properties: string[]
  ): Promise<DataCommonsResponse> {
    if (!searchData.results || searchData.results.length === 0) {
      return {
        success: true,
        query: query.query,
        results: [],
        totalResults: 0,
        entityType: query.entityType || "general",
        dataSource: "DataCommons",
      };
    }

    // Step 2: Get detailed data for the found entities
    const entityIds = searchData.results
      .slice(0, query.limit || 20)
      .map((result: any) => result.dcid)
      .filter(Boolean);

    if (entityIds.length === 0) {
      return {
        success: true,
        query: query.query,
        results: [],
        totalResults: 0,
        entityType: query.entityType || "general",
        dataSource: "DataCommons",
      };
    }

    // Step 3: Get property values for the entities
    const propertyParams = new URLSearchParams({
      nodes: entityIds.join(","),
      property: properties.join(","),
      ...getDataCommonsQueryParams(),
    });

    const propertyResponse = await fetch(
      `${this.baseUrl}/node?${propertyParams.toString()}`,
      {
        method: "GET",
        headers: getDataCommonsHeaders(),
      }
    );

    if (!propertyResponse.ok) {
      throw new Error(
        `DataCommons property API error: ${propertyResponse.status}`
      );
    }

    const propertyData = await propertyResponse.json();

    // Step 4: Process and format the results
    const results: DataCommonsResult[] = entityIds
      .map((dcid: string) => {
        const entityData = propertyData.data?.[dcid] || {};
        const searchResult = searchData.results.find(
          (r: any) => r.dcid === dcid
        );

        return {
          dcid,
          name: entityData.name?.[0] || searchResult?.name || "Unknown",
          type: entityData.typeOf?.[0] || "Place",
          description: entityData.description?.[0] || searchResult?.description,
          population: entityData.population?.[0]
            ? Number(entityData.population[0])
            : undefined,
          medianIncome: entityData.medianIncome?.[0]
            ? Number(entityData.medianIncome[0])
            : undefined,
          unemploymentRate: entityData.unemploymentRate?.[0]
            ? Number(entityData.unemploymentRate[0])
            : undefined,
          gdp: entityData.gdp?.[0] ? Number(entityData.gdp[0]) : undefined,
          lifeExpectancy: entityData.lifeExpectancy?.[0]
            ? Number(entityData.lifeExpectancy[0])
            : undefined,
        };
      })
      .filter((result) => result.name !== "Unknown");

    return {
      success: true,
      query: query.query,
      results,
      totalResults: results.length,
      entityType: query.entityType || "general",
      dataSource: "DataCommons",
    };
  }

  // Query DataCommons API
  async queryData(query: DataCommonsQuery): Promise<DataCommonsResponse> {
    try {
      const { properties } = this.parseQuery(query.query);

      // Check if we have API credentials
      if (!DATACOMMONS_CONFIG.apiKey) {
        console.warn("No DataCommons API key found, using mock data");
        return this.getMockDataResponse(query);
      }

      // Step 1: Search for entities using the search API
      const queryParams = new URLSearchParams({
        query: query.query,
        ...getDataCommonsQueryParams(),
      });

      const searchResponse = await fetch(
        `${this.baseUrl}/search?${queryParams.toString()}`,
        {
          method: "GET",
          headers: getDataCommonsHeaders(),
        }
      );

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error("DataCommons API Error:", {
          status: searchResponse.status,
          statusText: searchResponse.statusText,
          url: searchResponse.url,
          error: errorText,
        });

        // If v2 fails, try v1 as fallback
        if (this.baseUrl.includes("/v2") && searchResponse.status === 401) {
          console.log("Trying fallback to v1 API...");
          const fallbackParams = new URLSearchParams({
            query: query.query,
            ...getDataCommonsQueryParams(),
          });
          const fallbackResponse = await fetch(
            `${DATACOMMONS_CONFIG.fallbackBaseUrl}/search?${fallbackParams.toString()}`,
            {
              method: "GET",
              headers: getDataCommonsHeaders(),
            }
          );

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            return this.processSearchResults(fallbackData, query, properties);
          }
          const fallbackError = await fallbackResponse.text();
          console.error("Fallback API Error:", {
            status: fallbackResponse.status,
            error: fallbackError,
          });
        }

        // If API fails, fall back to mock data
        console.warn("DataCommons API failed, falling back to mock data");
        return this.getMockDataResponse(query);
      }

      const searchData = await searchResponse.json();
      return this.processSearchResults(searchData, query, properties);
    } catch (error) {
      console.error("DataCommons API error:", error);
      console.warn("Falling back to mock data due to API error");
      return this.getMockDataResponse(query);
    }
  }

  // Query DataCommons NL API for natural language processing
  async queryNL(query: DataCommonsNLQuery, mode: 'toolformer_rig' | 'toolformer_rag' = 'toolformer_rig'): Promise<DataCommonsNLResponse> {
    try {
      console.log('🔍 DataCommons service queryNL called:', { query: query.query, mode });
      
      // Check if we have API credentials
      if (!DATACOMMONS_CONFIG.apiKey) {
        console.warn("No DataCommons API key found, using fallback");
        return {
          success: false,
          query: query.query,
          error: "DataCommons API key not configured",
          source: "DataCommons NL",
          fallback: true,
        };
      }

      // Build query parameters for GET request
      const params = new URLSearchParams({
        q: query.query,
        mode: mode,
        idx: 'base_uae_mem',
      });

      // Add mode-specific parameters
      if (mode === 'toolformer_rig') {
        params.set('allCharts', '1');
      } else if (mode === 'toolformer_rag') {
        params.set('client', 'table');
      }

      // Call our internal API proxy with GET request
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/datacommons/nl?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          query: query.query,
          error: errorData.error || `HTTP ${response.status}`,
          source: "DataCommons NL",
          fallback: errorData.fallback || false,
        };
      }

      const data = await response.json();
      return {
        success: true,
        query: query.query,
        data: data.data,
        source: data.source || "DataCommons NL",
        mode: data.mode,
      };
    } catch (error) {
      console.error("DataCommons NL service error:", error);
      return {
        success: false,
        query: query.query,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        source: "DataCommons NL",
        fallback: true,
      };
    }
  }
}

export const dataCommonsService = new DataCommonsService();
