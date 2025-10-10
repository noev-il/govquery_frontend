"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, MessageSquare } from "lucide-react";

interface DataCommonsResult {
  success: boolean;
  data?: {
    charts: Array<{
      title: string;
      highlight?: {
        value: number;
        date: string;
      };
      dataCsv?: string;
      places?: string[];
      srcs?: Array<{
        name: string;
        url: string;
      }>;
    }>;
  };
  source: string;
  mode?: string;
  error?: string;
}

interface DataCommonsChatIntegrationProps {
  onDataReady: (data: string, context: string) => void;
}

export function DataCommonsChatIntegration({ onDataReady }: DataCommonsChatIntegrationProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DataCommonsResult | null>(null);
  const [mode, setMode] = useState<"toolformer_rig" | "toolformer_rag">("toolformer_rig");

  const handleQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const params = new URLSearchParams({
        q: query,
        mode: mode,
        idx: "base_uae_mem",
      });

      if (mode === "toolformer_rig") {
        params.set("allCharts", "1");
      } else if (mode === "toolformer_rag") {
        params.set("client", "table");
      }

      const response = await fetch(`/api/datacommons/nl?${params.toString()}`);
      const data = await response.json();
      
      setResult(data);
    } catch (error) {
      console.error("DataCommons query error:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        source: "DataCommons NL",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToChat = () => {
    if (!result?.success || !result.data?.charts) return;

    const mainChart = result.data.charts[0];
    const mainValue = mainChart.highlight;
    
    let dataSummary = "";
    if (mainValue) {
      dataSummary = `${mainChart.title}: ${new Intl.NumberFormat().format(mainValue.value)} (${mainValue.date})`;
    }

    // Add additional context
    const context = `Data from DataCommons NL (${result.source}). Query: "${query}". Mode: ${result.mode}.`;
    
    // Create a comprehensive data summary for the AI
    const fullData = {
      query: query,
      mainResult: dataSummary,
      allCharts: result.data.charts.map(chart => ({
        title: chart.title,
        highlight: chart.highlight,
        places: chart.places,
        sources: chart.srcs
      })),
      metadata: {
        source: result.source,
        mode: result.mode,
        timestamp: new Date().toISOString()
      }
    };

    onDataReady(JSON.stringify(fullData, null, 2), context);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getMainValue = () => {
    if (!result?.data?.charts?.[0]?.highlight) return null;
    return result.data.charts[0].highlight;
  };

  const mainValue = getMainValue();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          DataCommons Data Source
        </CardTitle>
        <CardDescription>
          Query DataCommons NL and send the results to chat for AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Query Input */}
        <div className="space-y-2">
          <Label htmlFor="query">Data Query</Label>
          <div className="flex gap-2">
            <Input
              id="query"
              placeholder="e.g., What is the population of the United States?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            />
            <Button onClick={handleQuery} disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Query
            </Button>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="rig"
              name="mode"
              value="toolformer_rig"
              checked={mode === "toolformer_rig"}
              onChange={(e) => setMode(e.target.value as "toolformer_rig")}
            />
            <Label htmlFor="rig">Point Statistics</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="rag"
              name="mode"
              value="toolformer_rag"
              checked={mode === "toolformer_rag"}
              onChange={(e) => setMode(e.target.value as "toolformer_rag")}
            />
            <Label htmlFor="rag">Table Data</Label>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "Success" : "Error"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Source: {result.source}
              </span>
              {result.mode && (
                <Badge variant="outline">Mode: {result.mode}</Badge>
              )}
            </div>

            {result.success && mainValue && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {result.data?.charts[0]?.title || "Result"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatNumber(mainValue.value)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {mainValue.date}
                  </div>
                  {result.data?.charts[0]?.srcs?.[0] && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Source: {result.data.charts[0].srcs[0].name}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {result.success && (
              <Button 
                onClick={handleSendToChat}
                className="w-full"
                disabled={!result.success}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Data to Chat
              </Button>
            )}

            {!result.success && (
              <Card className="border-destructive">
                <CardContent className="pt-4">
                  <div className="text-destructive font-medium">Error</div>
                  <div className="text-sm text-muted-foreground">
                    {result.error}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
