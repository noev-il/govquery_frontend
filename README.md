# GovQuery Frontend Integration

This document describes the GovQuery integration in the Next.js frontend application.

## Overview

The frontend now includes:
- **AI Chat Tools**: Both GovQuery and DataCommons tools integrated into the chat interface
- **Dedicated GovQuery Page**: Specialized interface at `/govquery` for government data queries
- **DataCommons Service**: Cloud API integration for demographic and geographic data
- **SQLGlot Integration**: SQL parsing and validation capabilities

## New Features

### 1. Chat Integration

The chat interface now includes two new AI tools:

#### GovQuery Tool
- **Purpose**: Converts natural language to SQL for government census data
- **Usage**: Ask questions like "What is the population of California?" or "Show me median income by state"
- **Features**: Supports table code selection, model choice, and confidence scoring

#### DataCommons Tool
- **Purpose**: Queries general demographic and geographic data
- **Usage**: Ask questions like "What is the unemployment rate in Texas?" or "Show me education data by city"
- **Features**: Supports entity type filtering and result limiting

### 2. GovQuery Page

Access the dedicated page at `/govquery` with:

#### Query Interface
- Natural language input field
- Optional table schema selection
- Model choice (auto, T5, SQLCoder)
- Example questions for guidance

#### Results Display
- Generated SQL query with syntax highlighting
- Model metadata (confidence, model used, etc.)
- Schema context information
- Copy-to-clipboard functionality

#### Schema Browser
- Browse all available data tables
- View table details and columns
- Search and filter schemas
- Expandable schema information

### 3. Navigation

The sidebar now includes:
- **💬 Chat**: Main chat interface (existing)
- **🏛️ GovQuery Data**: Dedicated GovQuery page (new)

## Technical Implementation

### File Structure

```
govquery_frontend/
├── app/
│   ├── govquery/                 # New GovQuery page
│   │   ├── page.tsx             # Main page component
│   │   └── layout.tsx           # Page layout
│   └── api/
│       └── govquery/            # API proxy routes
│           ├── route.ts         # Main proxy
│           └── schemas/route.ts # Schemas proxy
├── components/
│   └── govquery/                # GovQuery components
│       ├── query-form.tsx       # Query input form
│       ├── results-display.tsx  # Results display
│       └── schema-selector.tsx  # Schema browser
├── lib/
│   ├── datacommons/             # DataCommons integration
│   │   ├── config.ts           # API configuration
│   │   └── service.ts          # Service implementation
│   ├── govquery/               # GovQuery integration
│   │   ├── client.ts           # API client
│   │   ├── types.ts            # TypeScript types
│   │   └── sql-parser.ts       # SQL parsing utilities
│   └── ai/
│       └── tools/              # AI chat tools
│           ├── query-govdata.ts    # GovQuery tool
│           └── query-datacommons.ts # DataCommons tool
└── components/ui/
    └── tabs.tsx                # Tabs component
```

### Key Components

#### GovQueryClient
- TypeScript client for communicating with Python backend
- Handles all API calls with retry logic and error handling
- Supports health checks, schema listing, and query conversion

#### DataCommonsService
- Service for querying DataCommons cloud API
- Includes fallback to mock data if API unavailable
- Supports multiple data types and result filtering

#### AI Tools
- `queryGovData`: Converts natural language to SQL for government data
- `queryDataCommons`: Queries general demographic and geographic data
- Both tools integrated into the chat interface

### Environment Variables

Required environment variables:

```env
# DataCommons API
DATACOMMONS_API_KEY=your_datacommons_api_key_here
DATACOMMONS_API_SECRET=your_datacommons_api_secret_here

# GovQuery Backend
GOVQUERY_BACKEND_URL=http://localhost:8000

# Existing variables
AI_GATEWAY_API_KEY=your_ai_gateway_api_key_here
POSTGRES_URL=your_postgres_url_here
BLOB_READ_WRITE_TOKEN=your_blob_token_here
AUTH_SECRET=your_auth_secret_here
```

## Usage

### 1. Chat Interface

Use the chat interface to ask questions about government data:

```
User: "What is the population of California?"
AI: [Uses GovQuery tool to generate SQL and provide results]

User: "Show me unemployment rates by state"
AI: [Uses DataCommons tool to query demographic data]
```

### 2. GovQuery Page

Visit `/govquery` for the dedicated interface:

1. **Enter your question** in natural language
2. **Select table schemas** (optional) to focus your query
3. **Choose a model** (auto, T5, or SQLCoder)
4. **Click "Convert to SQL"** to generate the query
5. **Review results** including SQL, metadata, and explanations

### 3. Schema Browser

Use the "Browse Schemas" tab to explore available data:

- View all available government data tables
- See table descriptions and column information
- Search and filter schemas by name or code
- Expand schemas to see detailed information

## Development

### Adding New Features

1. **New AI Tools**: Add to `lib/ai/tools/` and update chat route
2. **New UI Components**: Add to `components/govquery/`
3. **New API Endpoints**: Add to `app/api/govquery/`
4. **New Data Sources**: Extend DataCommons service or add new services

### Testing

```bash
# Run linting
pnpm lint

# Run tests
pnpm test

# Check TypeScript
pnpm build
```

### Building

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

## Troubleshooting

### Common Issues

1. **Backend Not Available**
   - Ensure GovQuery backend is running on port 8000
   - Check backend logs for errors
   - Verify Python dependencies are installed

2. **DataCommons API Errors**
   - Verify API key is set correctly
   - Check API key validity
   - Review network connectivity

3. **TypeScript Errors**
   - Run `pnpm lint` to check for issues
   - Ensure all imports are correct
   - Check for missing dependencies

4. **UI Components Not Loading**
   - Verify all UI components are properly imported
   - Check for missing dependencies
   - Review console for errors

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

## API Reference

### GovQuery Client

```typescript
import { govQueryClient } from '@/lib/govquery/client';

// Health check
const health = await govQueryClient.healthCheck();

// List schemas
const schemas = await govQueryClient.listSchemas();

// Convert to SQL
const response = await govQueryClient.convertToSQL({
  query: "What is the population of California?",
  table_codes: ["B01001"],
  model_choice: "auto"
});
```

### DataCommons Service

```typescript
import { dataCommonsService } from '@/lib/datacommons/service';

// Query data
const response = await dataCommonsService.queryData({
  query: "Show me population by state",
  entityType: "demographic",
  limit: 20
});
```

## Contributing

When contributing to the GovQuery frontend integration:

1. Follow the existing code style and patterns
2. Add proper TypeScript types for all new features
3. Include error handling and loading states
4. Test both success and error scenarios
5. Update documentation for new features

## License

[Add your license information here]
