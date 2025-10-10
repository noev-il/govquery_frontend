import { NextRequest, NextResponse } from "next/server";
import { govQueryClient, GovQueryClient } from "@/lib/govquery/client";

// Create a backend client for server-side API routes
const backendClient = new GovQueryClient({
  baseUrl: "http://localhost:8000"
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableCode = searchParams.get("table_code");
    
    // Check if backend is available
    const isAvailable = await backendClient.isAvailable();
    if (!isAvailable) {
      return NextResponse.json(
        { error: "GovQuery backend is not available" },
        { status: 503 }
      );
    }

    if (tableCode) {
      // Get specific schema
      const schema = await backendClient.getSchema(tableCode);
      return NextResponse.json(schema);
    } else {
      // Get all schemas
      const schemas = await backendClient.listSchemas();
      return NextResponse.json(schemas);
    }
  } catch (error) {
    console.error("GovQuery schemas API error:", error);
    
    if (error instanceof Error) {
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
