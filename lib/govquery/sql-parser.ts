// SQL Parser using SQLGlot
// Provides SQL syntax validation and parsing functionality

import { SQLParseResult } from "./types";

// For now, we'll use a simple regex-based parser
// In production, you might want to use a more robust SQL parser
// or call the backend's SQLGlot functionality

export class SQLParser {
  private static readonly SQL_KEYWORDS = [
    "SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "LIMIT",
    "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER", "INDEX",
    "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN",
    "UNION", "INTERSECT", "EXCEPT", "WITH", "AS", "ON", "AND", "OR", "NOT",
    "IN", "EXISTS", "BETWEEN", "LIKE", "IS NULL", "IS NOT NULL",
    "COUNT", "SUM", "AVG", "MIN", "MAX", "DISTINCT", "ALL"
  ];

  static parseSQL(sql: string): SQLParseResult {
    try {
      // Basic validation
      const trimmedSQL = sql.trim();
      
      if (!trimmedSQL) {
        return {
          valid: false,
          error: "Empty SQL query"
        };
      }

      // Check if it starts with a valid SQL keyword
      const firstWord = trimmedSQL.split(/\s+/)[0].toUpperCase();
      if (!this.SQL_KEYWORDS.includes(firstWord)) {
        return {
          valid: false,
          error: `Invalid SQL statement. Must start with a valid keyword, got: ${firstWord}`
        };
      }

      // Basic syntax checks
      const openParens = (trimmedSQL.match(/\(/g) || []).length;
      const closeParens = (trimmedSQL.match(/\)/g) || []).length;
      
      if (openParens !== closeParens) {
        return {
          valid: false,
          error: "Mismatched parentheses"
        };
      }

      // Check for basic SELECT structure
      if (firstWord === "SELECT") {
        if (!trimmedSQL.toUpperCase().includes("FROM")) {
          return {
            valid: false,
            error: "SELECT statement must include FROM clause"
          };
        }
      }

      // Format SQL (basic formatting)
      const formattedSQL = this.formatSQL(trimmedSQL);

      return {
        valid: true,
        formatted_sql: formattedSQL,
        ast: this.createBasicAST(trimmedSQL)
      };

    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Unknown parsing error"
      };
    }
  }

  private static formatSQL(sql: string): string {
    // Basic SQL formatting
    return sql
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\s*,\s*/g, ",\n  ") // Format commas
      .replace(/\s+(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT)\s+/gi, "\n$1 ")
      .replace(/\s+(JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN)\s+/gi, "\n$1 ")
      .replace(/\s+(AND|OR)\s+/gi, "\n  $1 ")
      .trim();
  }

  private static createBasicAST(sql: string): any {
    // Create a basic AST structure
    const upperSQL = sql.toUpperCase();
    
    return {
      type: "SELECT", // Simplified - in real implementation, parse the actual type
      columns: this.extractColumns(sql),
      from: this.extractFrom(sql),
      where: this.extractWhere(sql),
      groupBy: this.extractGroupBy(sql),
      orderBy: this.extractOrderBy(sql),
      limit: this.extractLimit(sql)
    };
  }

  private static extractColumns(sql: string): string[] {
    const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/i);
    if (!selectMatch) return [];
    
    return selectMatch[1]
      .split(",")
      .map(col => col.trim())
      .filter(col => col.length > 0);
  }

  private static extractFrom(sql: string): string | null {
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    return fromMatch ? fromMatch[1] : null;
  }

  private static extractWhere(sql: string): string | null {
    const whereMatch = sql.match(/WHERE\s+(.*?)(?:\s+GROUP BY|\s+ORDER BY|\s+HAVING|\s+LIMIT|$)/i);
    return whereMatch ? whereMatch[1].trim() : null;
  }

  private static extractGroupBy(sql: string): string | null {
    const groupByMatch = sql.match(/GROUP BY\s+(.*?)(?:\s+ORDER BY|\s+HAVING|\s+LIMIT|$)/i);
    return groupByMatch ? groupByMatch[1].trim() : null;
  }

  private static extractOrderBy(sql: string): string | null {
    const orderByMatch = sql.match(/ORDER BY\s+(.*?)(?:\s+LIMIT|$)/i);
    return orderByMatch ? orderByMatch[1].trim() : null;
  }

  private static extractLimit(sql: string): string | null {
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    return limitMatch ? limitMatch[1] : null;
  }

  static validateSQL(sql: string): { valid: boolean; errors: string[] } {
    const result = this.parseSQL(sql);
    return {
      valid: result.valid,
      errors: result.error ? [result.error] : []
    };
  }
}
