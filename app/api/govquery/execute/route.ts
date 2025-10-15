import { NextRequest, NextResponse } from "next/server";
import { ExecuteRequest } from "@/lib/govquery/types";

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json();
    
    console.log('🔍 Frontend API: Received execute request:', {
      sql: body.sql?.substring(0, 100) + '...',
      max_rows: body.max_rows
    });
    
    // Validate required fields
    if (!body.sql) {
      return NextResponse.json(
        { error: "SQL query is required" },
        { status: 400 }
      );
    }

    // Forward request to GovQuery backend
    console.log('🔍 Frontend API: Forwarding execute request to backend...');
    const response = await fetch("http://localhost:8000/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Backend request failed: ${response.status} ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
    }
    
    const responseData = await response.json();
    
    console.log('🔍 Frontend API: Received execute response from backend:', {
      success: responseData.success,
      row_count: responseData.row_count,
      execution_time_ms: responseData.execution_time_ms,
      error: responseData.error
    });
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("GovQuery Execute API error:", error);
    
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
