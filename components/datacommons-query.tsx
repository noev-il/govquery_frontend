"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, BarChart3 } from "lucide-react";

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

export function DataCommonsQuery() {
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getMainValue = () => {
    if (!result?.data?.charts?.[0]?.highlight) return null;
    return result.data.charts[0].highlight;
  };

  const mainValue = getMainValue();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          DataCommons Query
        </CardTitle>
        <CardDescription>
          Query DataCommons NL directly for data, statistics, and information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Query Input */}
        <div className="space-y-2">
          <Label htmlFor="query">Question</Label>
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
                <BarChart3 className="h-4 w-4" />
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
            <Label htmlFor="rig">Point Statistics (single values)</Label>
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
            <Label htmlFor="rag">Table Data (comparisons)</Label>
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

            {result.success && result.data?.charts && result.data.charts.length > 1 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Additional Data</h4>
                <div className="grid gap-2">
                  {result.data.charts.slice(1).map((chart, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="font-medium">{chart.title}</div>
                        {chart.highlight && (
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(chart.highlight.value)} ({chart.highlight.date})
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
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

        {/* Example Queries */}
        <div className="space-y-2">
          <h4 className="font-semibold">Example Queries</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "What is the population of the United States?",
              "Show me unemployment rates by state",
              "What is the median income in California?",
              "Compare population between Texas and Florida",
              "What are the education levels in major cities?",
              "Show me GDP by country"
            ].map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(example)}
                className="justify-start text-left h-auto p-2"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
