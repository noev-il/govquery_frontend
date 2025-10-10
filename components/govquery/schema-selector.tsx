"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Info,
  Table
} from "lucide-react";
import { govQueryClient } from "@/lib/govquery/client";
import { SchemaInfo } from "@/lib/govquery/types";

interface SchemaSelectorProps {
  onSchemaSelect?: (schema: SchemaInfo) => void;
  selectedSchemas?: string[];
}

export function SchemaSelector({ onSchemaSelect, selectedSchemas = [] }: SchemaSelectorProps) {
  const [schemas, setSchemas] = useState<SchemaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSchema, setExpandedSchema] = useState<string | null>(null);

  const loadSchemas = async () => {
    try {
      console.log('🔍 SchemaSelector: Starting to load schemas...');
      setLoading(true);
      setError(null);
      const schemaList = await govQueryClient.listSchemas();
      console.log('🔍 SchemaSelector: Successfully loaded schemas:', schemaList.length);
      setSchemas(schemaList);
    } catch (err) {
      console.error('🔍 SchemaSelector: Failed to load schemas:', err);
      setError(err instanceof Error ? err.message : "Failed to load schemas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemas();
  }, []);

  const filteredSchemas = schemas.filter(schema =>
    schema.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schema.table_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSchemaExpansion = (tableCode: string) => {
    setExpandedSchema(expandedSchema === tableCode ? null : tableCode);
  };

  return (
    <div id="schema-selector" className="w-full">
      {loading && (
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading schemas...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="w-full border-destructive">
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Failed to load schemas</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
              <Button onClick={loadSchemas} className="mt-4" size="sm">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Available Data Schemas
        </CardTitle>
        <CardDescription>
          Browse and explore the available government data tables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schemas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {filteredSchemas.map((schema) => (
              <Card key={schema.table_code} className="border">
                <CardHeader 
                  className="pb-2 cursor-pointer"
                  onClick={() => toggleSchemaExpansion(schema.table_code)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {expandedSchema === schema.table_code ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <Table className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{schema.table_code}</div>
                        <div className="text-sm text-muted-foreground">
                          {schema.table_name}
                        </div>
                      </div>
                    </div>
                    {selectedSchemas.includes(schema.table_code) && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </CardHeader>
                
                {expandedSchema === schema.table_code && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Geography Levels</h4>
                        <div className="flex flex-wrap gap-1">
                          {schema.geography_levels.map((level) => (
                            <Badge key={level} variant="outline" className="text-xs">
                              {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Columns ({schema.columns.length})</h4>
                        <ScrollArea className="h-32">
                          <div className="space-y-1">
                            {schema.columns.map((column, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{column.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {column.type}
                                  </Badge>
                                </div>
                                {column.description && (
                                  <span className="text-muted-foreground truncate max-w-xs">
                                    {column.description}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSchemaSelect?.(schema)}
                        className="w-full"
                      >
                        <Info className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>

        {filteredSchemas.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No schemas found matching "{searchTerm}"</p>
          </div>
        )}
      </CardContent>
    </Card>
      )}
    </div>
  );
}
