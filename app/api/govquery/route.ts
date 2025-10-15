import { NextRequest, NextResponse } from "next/server";
import { govQueryClient, GovQueryClient } from "@/lib/govquery/client";
import { QueryRequest, ExecuteRequest } from "@/lib/govquery/types";

// Create a backend client for server-side API routes
const backendClient = new GovQueryClient({
  baseUrl: "http://localhost:8000"
});

export async function POST(request: NextRequest) {
  try {
    const body: QueryRequest = await request.json();
    
    console.log('🔍 Frontend API: Received query request:', {
      query: body.query,
      table_codes: body.table_codes,
      model_choice: body.model_choice
    });
    
    // Validate required fields
    if (!body.query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Forward request to GovQuery backend (let the client handle availability checks)
    console.log('🔍 Frontend API: Forwarding to backend...');
    const response = await fetch("http://localhost:8000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    console.log('🔍 Frontend API: Received response from backend:', {
      sql_query: responseData.sql_query?.substring(0, 100) + '...',
      model_used: responseData.model_used,
      confidence: responseData.confidence,
      deployment_status: responseData.deployment_status,
      error: responseData.error
    });
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("GovQuery API error:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("timeout") || error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { error: "GovQuery backend is not available" },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Health check endpoint - call backend directly
    const response = await fetch("http://localhost:8000/");
    const data = await response.json();
    
    // Transform the response to match HealthResponse format
    const health = {
      status: "healthy",
      schemas_loaded: 0, // We'll get this from schemas endpoint
      modal_app_running: false,
      modal_app_name: "",
      deployment_attempted: false,
      features: {
        auto_deployment: data.features?.includes("Automatic Modal app deployment") || false,
        cold_start_fallback: data.features?.includes("Cold start fallback handling") || false,
        smart_error_recovery: data.features?.includes("Smart error recovery") || false,
        auto_stop: "enabled"
      }
    };
    
    return NextResponse.json(health);
  } catch (error) {
    console.error("GovQuery health check error:", error);
    return NextResponse.json(
      { 
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 503 }
    );
  }
}
