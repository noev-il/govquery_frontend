"use client";

import { useState, useEffect } from "react";
import { QueryForm } from "@/components/govquery/query-form";
import { ResultsDisplay } from "@/components/govquery/results-display";
import { SchemaSelector } from "@/components/govquery/schema-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { govQueryClient } from "@/lib/govquery/client";
import { QueryResponse, SchemaInfo } from "@/lib/govquery/types";
import { Database, Search, Table } from "lucide-react";

export default function GovQueryPage() {
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  // Check backend status on component mount (with delay to avoid blocking initial render)
  useEffect(() => {
    const timer = setTimeout(() => {
      checkBackendStatus();
    }, 100); // Small delay to let UI render first
    
    return () => clearTimeout(timer);
  }, []);

  const checkBackendStatus = async () => {
    try {
      console.log('🔍 Frontend: Checking backend status...');
      console.log('🔍 Frontend: Client config:', govQueryClient);
      const isAvailable = await govQueryClient.isAvailable();
      console.log('🔍 Frontend: Backend available:', isAvailable);
      setBackendStatus(isAvailable ? "online" : "offline");
    } catch (error) {
      console.error('🔍 Frontend: Backend check failed:', error);
      setBackendStatus("offline");
    }
  };

  const handleQuerySubmit = async (query: string, tableCodes: string[], modelChoice: string) => {
    setIsLoading(true);
    setCurrentQuery(query);
    setResponse(null);

    try {
      console.log('🔍 Frontend: Submitting query to backend...', {
        query,
        tableCodes,
        modelChoice
      });

      const result = await govQueryClient.convertToSQL({
        query,
        table_codes: tableCodes.length > 0 ? tableCodes : undefined,
        model_choice: modelChoice,
        max_tokens: 512,
        temperature: 0.1,
      });

      console.log('🔍 Frontend: Received response from backend:', result);
      
      // Log Modal SQL response for debugging
      if (result.sql_query) {
        console.log('📊 Modal SQL Response:', result.sql_query);
        console.log('📊 Modal Model Used:', result.model_used);
        console.log('📊 Modal Confidence:', result.confidence);
        console.log('📊 Modal Deployment Status:', result.deployment_status);
      }

      setResponse(result);
    } catch (error) {
      console.error('🔍 Frontend: Query submission failed:', error);
      setResponse({
        sql_query: "",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchemaSelect = (schema: SchemaInfo) => {
    // This could be used to pre-populate the query form or show schema details
    console.log("Selected schema:", schema);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          GovQuery Data Explorer
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ask questions about government census and demographic data using natural language. 
          Our AI converts your questions into SQL queries for government datasets.
        </p>
        
        {/* Backend Status */}
        <div className="flex items-center justify-center gap-2">
          <Badge 
            variant={backendStatus === "online" ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            <Database className="h-3 w-3" />
            Backend {backendStatus === "online" ? "Online" : "Offline"}
          </Badge>
          {backendStatus === "offline" && (
            <p className="text-sm text-muted-foreground">
              Make sure the GovQuery backend is running on localhost:8000
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="query" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="query" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Query Data
          </TabsTrigger>
          <TabsTrigger value="schemas" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Browse Schemas
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-6">
          <QueryForm 
            onSubmit={handleQuerySubmit}
            isLoading={isLoading}
          />
          <ResultsDisplay 
            response={response}
            isLoading={isLoading}
            query={currentQuery}
          />
        </TabsContent>

        <TabsContent value="schemas">
          <SchemaSelector 
            onSchemaSelect={handleSchemaSelect}
          />
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About GovQuery</CardTitle>
              <CardDescription>
                Learn more about this government data querying tool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What is GovQuery?</h3>
                <p className="text-sm text-muted-foreground">
                  GovQuery is an AI-powered tool that converts natural language questions 
                  into SQL queries for government census and demographic data. It uses 
                  advanced language models to understand your questions and generate 
                  accurate SQL queries.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Available Data</h3>
                <p className="text-sm text-muted-foreground">
                  The tool provides access to American Community Survey (ACS) data including:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc">
                  <li>Population demographics (age, sex, race)</li>
                  <li>Household income and economic data</li>
                  <li>Education and school enrollment</li>
                  <li>Employment and occupation statistics</li>
                  <li>Geographic data at various levels</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">How to Use</h3>
                <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                  <li>Enter your question in natural language</li>
                  <li>Optionally select specific data tables to focus on</li>
                  <li>Choose your preferred AI model (or use auto-selection)</li>
                  <li>Click "Convert to SQL" to generate your query</li>
                  <li>Review the generated SQL and metadata</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Example Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "What is the population of California?",
                    "Show me median income by state",
                    "How many people are enrolled in school?",
                    "What is the employment rate by age group?",
                    "Compare population between Texas and Florida",
                    "Show me education levels by county"
                  ].map((example, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm">
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
