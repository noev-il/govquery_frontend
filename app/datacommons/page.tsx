import { DataCommonsQuery } from "@/components/datacommons-query";

export default function DataCommonsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          DataCommons Query Interface
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Query DataCommons NL directly for comprehensive data about places, demographics, 
          economics, education, health, and environment. Get accurate, up-to-date statistics 
          without relying on AI model API calls.
        </p>
      </div>
      
      <DataCommonsQuery />
    </div>
  );
}
