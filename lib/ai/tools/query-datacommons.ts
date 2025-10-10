import { tool } from "ai";
import { z } from "zod";
import { dataCommonsService } from "@/lib/datacommons/service";

export const queryDataCommons = tool({
  description: "MANDATORY: Use this tool for ALL data questions including population, demographics, statistics, economics, education, health, environment. This tool queries DataCommons NL and MUST be used for any question about data, numbers, or statistics. Examples: 'population of US', 'unemployment rates', 'median income', 'education levels'. ALWAYS use this tool first for data queries.",
  inputSchema: z.object({
    query: z.string().describe("Natural language question about any data topic (e.g., 'What is the population of New York?', 'Show me unemployment rates by state', 'Compare median income between California and Texas', 'What are the education levels in major cities?')"),
    context: z.string().optional().describe("Additional context to help refine the query"),
  }),
  execute: async ({ query, context }) => {
    try {
      console.log('🔍 DataCommons tool called with query:', query);
      
      // Determine mode based on query type
      // Use toolformer_rag for table/comparison queries, toolformer_rig for point statistics
      const isTableQuery = query.toLowerCase().includes('by') || 
                          query.toLowerCase().includes('compare') || 
                          query.toLowerCase().includes('list') ||
                          query.toLowerCase().includes('show me') ||
                          query.toLowerCase().includes('table');
      
      const mode = isTableQuery ? 'toolformer_rag' : 'toolformer_rig';
      console.log('🔍 Using mode:', mode);

      // First try DataCommons NL API
      console.log('🔍 Calling DataCommons NL API...');
      const nlResponse = await dataCommonsService.queryNL({
        query,
        context,
      }, mode);
      
      console.log('🔍 NL API response:', nlResponse.success ? 'SUCCESS' : 'FAILED');

      if (nlResponse.success) {
        return {
          success: true,
          query,
          data: nlResponse.data,
          source: nlResponse.source,
          mode: nlResponse.mode,
          type: "nl_response",
        };
      }

      // If NL API fails, fall back to search API
      console.log("DataCommons NL failed, falling back to search API");
      console.log("NL API error:", nlResponse.error);
      const searchResponse = await dataCommonsService.queryData({
        query,
        limit: 20,
      });

      if (!searchResponse.success) {
        return {
          success: false,
          error: searchResponse.error || "DataCommons query failed",
          query,
          dataSource: searchResponse.dataSource,
          fallback: true,
        };
      }

      return {
        success: true,
        query,
        results: searchResponse.results,
        totalResults: searchResponse.totalResults,
        entityType: searchResponse.entityType,
        dataSource: searchResponse.dataSource,
        type: "search_response",
        fallback: true,
      };
    } catch (error) {
      console.error("DataCommons tool error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        query,
        fallback: true,
      };
    }
  },
});
