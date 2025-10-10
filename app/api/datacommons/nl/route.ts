import { NextRequest, NextResponse } from "next/server";
import { DATACOMMONS_CONFIG } from "@/lib/datacommons/config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const mode = searchParams.get('mode') || 'toolformer_rig';
    const allCharts = searchParams.get('allCharts') || '1';
    const client = searchParams.get('client') || 'table';
    const idx = searchParams.get('idx') || 'base_uae_mem';

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Check if API key is available
    if (!DATACOMMONS_CONFIG.apiKey) {
      return NextResponse.json(
        { 
          error: "DataCommons API key not configured",
          fallback: true 
        },
        { status: 503 }
      );
    }

    // Build the correct DataCommons NL API URL
    const url = new URL('https://nl.datacommons.org/nodejs/query');
    url.searchParams.set('q', query);
    url.searchParams.set('mode', mode);
    url.searchParams.set('idx', idx);
    url.searchParams.set('key', DATACOMMONS_CONFIG.apiKey);
    
    // Add mode-specific parameters
    if (mode === 'toolformer_rig') {
      url.searchParams.set('allCharts', allCharts);
    } else if (mode === 'toolformer_rag') {
      url.searchParams.set('client', client);
    }

    console.log('DataCommons NL API URL:', url.toString());

    // Make GET request to DataCommons NL API
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "GovQuery-Frontend/1.0.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DataCommons NL API Error:", {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        error: errorText,
      });

      return NextResponse.json(
        { 
          error: `DataCommons NL API error: ${response.status}`,
          details: errorText,
          fallback: true 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data,
      source: "DataCommons NL",
      mode,
    });

  } catch (error) {
    console.error("DataCommons NL proxy error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        fallback: true 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "DataCommons NL API uses GET requests, not POST" },
    { status: 405 }
  );
}
