// GovQuery API Types
// TypeScript interfaces matching the Python Pydantic models from the backend

export interface QueryRequest {
  query: string;
  table_codes?: string[];
  max_tokens?: number;
  temperature?: number;
  model_choice?: string;
}

export interface QueryResponse {
  sql_query: string;
  confidence?: number;
  explanation?: string;
  error?: string;
  schema_context_used?: string[];
  model_used?: string;
  prompt_length?: number;
  auto_selected?: boolean;
  deployment_status?: string;
}

export interface SchemaInfo {
  table_code: string;
  table_name: string;
  geography_levels: string[];
  columns: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
}

export interface HealthResponse {
  status: string;
  schemas_loaded?: number;
  modal_app_running?: boolean;
  modal_app_name?: string;
  deployment_attempted?: boolean;
  features?: {
    auto_deployment: boolean;
    cold_start_fallback: boolean;
    smart_error_recovery: boolean;
    auto_stop: string;
  };
  error?: string;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface GovQueryConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface SQLParseResult {
  valid: boolean;
  ast?: any;
  error?: string;
  formatted_sql?: string;
}
