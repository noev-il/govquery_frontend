import { tool } from "ai";
import { z } from "zod";
import { govQueryClient } from "@/lib/govquery/client";

export const queryGovData = tool({
  description: "Query government census and demographic data using natural language. Converts natural language questions to SQL queries for government datasets like population, income, education, and employment statistics.",
  inputSchema: z.object({
    query: z.string().describe("Natural language question about government data (e.g., 'What is the population of California?', 'Show me median income by state')"),
    table_codes: z.array(z.string()).optional().describe("Optional specific table codes to focus on (e.g., ['B01001', 'B19013'])"),
    model_choice: z.string().optional().describe("Model choice: 'auto', 't5', or 'sqlcoder'"),
  }),
  execute: async ({ query, table_codes, model_choice = "auto" }) => {
    try {
      // Convert natural language to SQL (let the client handle availability checks)
      const response = await govQueryClient.convertToSQL({
        query,
        table_codes,
        model_choice,
        max_tokens: 512,
        temperature: 0.1,
      });

      if (response.error) {
        return {
          success: false,
          error: response.error,
          query,
          sql_query: response.sql_query,
        };
      }

      return {
        success: true,
        query,
        sql_query: response.sql_query,
        confidence: response.confidence,
        explanation: response.explanation,
        model_used: response.model_used,
        schema_context_used: response.schema_context_used,
        deployment_status: response.deployment_status,
        auto_selected: response.auto_selected,
      };
    } catch (error) {
      console.error("GovQuery tool error:", error);
      
      // Handle specific error types
      if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
        return {
          success: false,
          error: "GovQuery backend is not available. Please ensure the backend is running on localhost:8000",
          query,
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        query,
      };
    }
  },
});
