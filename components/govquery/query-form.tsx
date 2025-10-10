"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Database } from "lucide-react";

interface QueryFormProps {
  onSubmit: (query: string, tableCodes: string[], modelChoice: string) => void;
  isLoading: boolean;
  availableSchemas?: Array<{ table_code: string; table_name: string }>;
}

const AVAILABLE_TABLE_CODES = [
  { code: "B01001", name: "Sex by Age" },
  { code: "B02001", name: "Race" },
  { code: "B14001", name: "School Enrollment" },
  { code: "B14002", name: "School Enrollment by Level" },
  { code: "B15003", name: "Educational Attainment" },
  { code: "B19001", name: "Household Income" },
  { code: "B19013", name: "Median Household Income" },
  { code: "B20005", name: "Sex by Work Experience" },
  { code: "B23006", name: "Employment Status" },
  { code: "B23025", name: "Employment Status by Age" },
  { code: "B24010", name: "Sex by Occupation" },
  { code: "DP02", name: "Selected Social Characteristics" },
];

export function QueryForm({ onSubmit, isLoading, availableSchemas = [] }: QueryFormProps) {
  const [query, setQuery] = useState("");
  const [selectedTableCodes, setSelectedTableCodes] = useState<string[]>([]);
  const [modelChoice, setModelChoice] = useState("auto");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim(), selectedTableCodes, modelChoice);
    }
  };

  const toggleTableCode = (code: string) => {
    setSelectedTableCodes(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const exampleQueries = [
    "What is the total population in California?",
    "Show me median household income by state",
    "How many people are enrolled in school in Texas?",
    "What is the employment rate by age group?",
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          GovQuery Data Explorer
        </CardTitle>
        <CardDescription>
          Ask questions about government census and demographic data using natural language
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Your Question</Label>
            <Textarea
              id="query"
              placeholder="e.g., What is the population of California by age group?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Table Schemas (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              Select specific data tables to focus your query on. Leave empty to search all available data.
            </p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TABLE_CODES.map((table) => (
                <Badge
                  key={table.code}
                  variant={selectedTableCodes.includes(table.code) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => toggleTableCode(table.code)}
                >
                  {table.code}: {table.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model Choice</Label>
            <select
              id="model"
              value={modelChoice}
              onChange={(e) => setModelChoice(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={isLoading}
            >
              <option value="auto">Auto (Recommended)</option>
              <option value="t5">T5 Model</option>
              <option value="sqlcoder">SQLCoder Model</option>
            </select>
          </div>

          <Button type="submit" disabled={isLoading || !query.trim()} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Convert to SQL
              </>
            )}
          </Button>
        </form>

        <div className="space-y-2">
          <Label>Example Questions</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(example)}
                disabled={isLoading}
                className="text-left justify-start h-auto p-3"
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
