"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  Code, 
  CheckCircle, 
  XCircle, 
  Copy, 
  ExternalLink,
  Brain,
  Zap,
  Info
} from "lucide-react";
import { useState } from "react";

interface QueryResponse {
  sql_query: string;
  confidence?: number;
  explanation?: string;
  error?: string;
  model_used?: string;
  schema_context_used?: string[];
  deployment_status?: string;
  auto_selected?: boolean;
}

interface ResultsDisplayProps {
  response: QueryResponse | null;
  isLoading: boolean;
  query: string;
}

export function ResultsDisplay({ response, isLoading, query }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Converting your question to SQL...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Enter a question above to see the generated SQL query</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (response.error) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{response.error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* SQL Query */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Generated SQL Query
          </CardTitle>
          <CardDescription>
            The AI converted your question into this SQL query
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <ScrollArea className="h-48 w-full rounded-md border p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {response.sql_query}
              </pre>
            </ScrollArea>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(response.sql_query)}
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              Model Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Model Used:</span>
              <Badge variant="outline">{response.model_used || "Unknown"}</Badge>
            </div>
            {response.auto_selected !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Auto Selected:</span>
                <Badge variant={response.auto_selected ? "default" : "secondary"}>
                  {response.auto_selected ? "Yes" : "No"}
                </Badge>
              </div>
            )}
            {response.deployment_status && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Deployment:</span>
                <Badge variant="outline">{response.deployment_status}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confidence & Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              Query Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {response.confidence !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Confidence:</span>
                <Badge 
                  variant={response.confidence > 0.8 ? "default" : response.confidence > 0.6 ? "secondary" : "destructive"}
                >
                  {Math.round(response.confidence * 100)}%
                </Badge>
              </div>
            )}
            {response.schema_context_used && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tables Used:</span>
                <span className="text-sm">{response.schema_context_used.length}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      {response.explanation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Info className="h-4 w-4" />
              Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{response.explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Schema Context */}
      {response.schema_context_used && response.schema_context_used.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Schema Context Used</CardTitle>
            <CardDescription>
              The following data tables were considered for this query
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {response.schema_context_used.map((tableCode) => (
                <Badge key={tableCode} variant="outline">
                  {tableCode}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
