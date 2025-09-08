# Technical Architecture

This document provides a comprehensive overview of Graph Explorer's technical
architecture, including system design, data flow, and key architectural
decisions.

## System Overview

Graph Explorer is a full-stack web application designed to visualize and explore
graph databases. The architecture follows a client-server pattern with a React
frontend and Node.js backend proxy server.

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │◄──►│  Graph Explorer  │◄──►│ Graph Database  │
│                 │    │   (Frontend)     │    │   (Neptune,     │
│                 │    │                  │    │   Gremlin, etc) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Proxy Server    │
                       │   (Backend)      │
                       │                  │
                       └──────────────────┘
```

## Frontend Architecture

### Technology Stack

- **Framework**: React 19.1.0 with TypeScript
- **Compiler**: React Compiler (eliminates need for manual optimizations)
- **Build Tool**: Vite 6.3.5 with React plugin
- **Styling**: TailwindCSS (primary), Emotion (being phased out)
- **State Management**: Jotai for atomic state management
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v7
- **Graph Visualization**: Cytoscape.js with layout plugins

### Component Architecture

```
src/
├── @types/                       # TypeScript type definitions
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components (Radix + Tailwind)
│   ├── forms/                   # Form components
│   └── layout/                  # Layout components
├── connector/                    # Database connection logic
│   ├── gremlin/                 # Gremlin-specific implementation
│   ├── openCypher/              # openCypher-specific implementation
│   └── sparql/                  # SPARQL-specific implementation
├── core/                        # Core application logic
│   ├── providers/               # React context providers
│   ├── stores/                  # Jotai state stores
│   └── config/                  # Configuration management
├── hooks/                       # Custom React hooks
├── modules/                     # Feature-specific modules
│   ├── GraphExplorer/           # Main graph exploration interface
│   ├── ConnectionsUI/           # Connection management
│   └── DataExplorer/            # Data browsing interface
├── utils/                       # Utility functions
├── workspaces/                  # Main application views
└── App.tsx                      # Root component
```

### State Management Architecture

#### Jotai Atoms

Graph Explorer uses Jotai for atomic state management:

```typescript
// Connection state
export const activeConnectionAtom = atom<Connection | null>(null);
export const connectionsAtom = atom<Connection[]>([]);

// Graph state
export const graphDataAtom = atom<GraphData>({ nodes: [], edges: [] });
export const selectedNodesAtom = atom<string[]>([]);

// UI state
export const sidebarOpenAtom = atom<boolean>(true);
export const layoutAtom = atom<LayoutType>("force");
```

#### Data Flow

1. **User Actions** → Component event handlers
2. **Event Handlers** → Jotai atom updates
3. **Atom Updates** → Component re-renders
4. **Side Effects** → TanStack Query mutations/queries

### Query Language Abstraction

#### Explorer Pattern

Each query language has its own "Explorer" that provides a unified interface:

```typescript
interface Explorer {
  fetchSchema(): Promise<Schema>;
  fetchNeighbors(nodeId: string): Promise<GraphData>;
  executeQuery(query: string): Promise<QueryResult>;
  fetchNodeDetails(nodeId: string): Promise<NodeDetails>;
}

// Implementations
class GremlinExplorer implements Explorer { ... }
class OpenCypherExplorer implements Explorer { ... }
class SparqlExplorer implements Explorer { ... }
```

#### Connector Architecture

```
connector/
├── index.ts                     # Common interfaces and types
├── gremlin/
│   ├── explorer/               # Gremlin query execution
│   ├── mappers/               # Data transformation
│   └── types.ts               # Gremlin-specific types
├── openCypher/
│   ├── explorer/              # openCypher query execution
│   ├── mappers/              # Data transformation
│   └── types.ts              # openCypher-specific types
└── sparql/
    ├── explorer/             # SPARQL query execution
    ├── mappers/             # Data transformation
    └── types.ts             # SPARQL-specific types
```

## Backend Architecture

### Technology Stack

- **Runtime**: Node.js with Express.js 5.1.0
- **Authentication**: AWS SDK for credential providers
- **Request Signing**: aws4 for SigV4 signing
- **Logging**: Pino with structured logging
- **Environment**: dotenv for configuration

### Server Structure

```
src/
├── node-server.ts              # Main Express server
├── env.ts                      # Environment configuration
├── logging.ts                  # Pino logger setup
├── error-handler.ts            # Error handling middleware
├── paths.ts                    # Route path utilities
└── middleware/                 # Custom middleware
    ├── auth.ts                # Authentication middleware
    ├── cors.ts                # CORS configuration
    └── proxy.ts               # Proxy middleware
```

### Request Flow

1. **Client Request** → Express server
2. **Middleware Chain** → Authentication, CORS, logging
3. **Route Handler** → Request processing
4. **Proxy Logic** → Forward to graph database
5. **Response Processing** → Transform and return data

### Authentication Architecture

#### AWS IAM Integration

```typescript
// Credential resolution chain
const credentialProvider = new CredentialProviderChain([
  new EnvironmentCredentials(),
  new EC2MetadataCredentials(),
  new ECSCredentials(),
  new SharedIniFileCredentials(),
]);

// Request signing
const signedRequest = aws4.sign(
  {
    host: neptuneEndpoint,
    path: requestPath,
    method: "POST",
    body: queryBody,
    service: "neptune-db",
  },
  credentials
);
```

## Data Storage Architecture

### Client-Side Storage

Graph Explorer stores all user data client-side using IndexedDB via localforage:

```typescript
// Storage interface
interface StorageService {
  getConnections(): Promise<Connection[]>;
  saveConnection(connection: Connection): Promise<void>;
  getUserPreferences(): Promise<UserPreferences>;
  saveUserPreferences(prefs: UserPreferences): Promise<void>;
}

// Implementation using localforage
class LocalStorageService implements StorageService {
  private store = localforage.createInstance({
    name: "graph-explorer",
    storeName: "user-data",
  });
}
```

### Data Persistence Scope

- **User Preferences**: Theme, layout settings, display options
- **Connection Configurations**: Database endpoints, authentication settings
- **Query History**: Previously executed queries
- **Visualization Settings**: Node/edge styling, layout preferences
- **Workspace State**: Current graph state, filters, selections

### No Server-Side Storage

The backend proxy server is stateless and does not persist any user data:

- **Stateless Design**: Each request is independent
- **No User Sessions**: No server-side session management
- **No Data Caching**: Graph data is not cached on the server
- **Security**: Reduces attack surface and privacy concerns

## Graph Visualization Architecture

### Cytoscape.js Integration

```typescript
// Core visualization engine
class GraphRenderer {
  private cy: cytoscape.Core;

  constructor(container: HTMLElement) {
    this.cy = cytoscape({
      container,
      elements: [],
      style: this.getStylesheet(),
      layout: { name: "force" },
    });
  }

  updateGraph(data: GraphData): void {
    this.cy.elements().remove();
    this.cy.add(this.transformData(data));
    this.cy.layout({ name: this.currentLayout }).run();
  }
}
```

### Layout System

```typescript
// Available layouts
const layouts = {
  force: { name: "cose", animate: true },
  hierarchical: { name: "dagre", rankDir: "TB" },
  circular: { name: "circle" },
  grid: { name: "grid" },
  concentric: { name: "concentric" },
};

// Layout management
class LayoutManager {
  applyLayout(layoutName: string, options?: LayoutOptions): void {
    const layout = layouts[layoutName];
    this.cy.layout({ ...layout, ...options }).run();
  }
}
```

## Performance Architecture

### Frontend Optimizations

#### React Compiler Integration

- **Automatic Memoization**: React Compiler handles optimization
- **No Manual useMemo/useCallback**: Compiler optimizes automatically
- **Reduced Bundle Size**: Eliminates need for manual optimization code

#### Virtualization

```typescript
// Large dataset handling
const VirtualizedNodeList = () => {
  const { data, isLoading } = useInfiniteQuery({
    queryKey: ['nodes'],
    queryFn: ({ pageParam = 0 }) => fetchNodes(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  return (
    <VirtualList
      height={400}
      itemCount={data?.pages.length ?? 0}
      itemSize={50}
      renderItem={({ index }) => <NodeItem node={data.pages[index]} />}
    />
  );
};
```

#### Query Optimization

```typescript
// TanStack Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Backend Optimizations

#### Request Batching

```typescript
// Batch multiple requests
class RequestBatcher {
  private queue: Request[] = [];
  private timer: NodeJS.Timeout | null = null;

  addRequest(request: Request): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...request, resolve, reject });
      this.scheduleFlush();
    });
  }

  private scheduleFlush(): void {
    if (this.timer) return;
    this.timer = setTimeout(() => this.flush(), 10);
  }
}
```

#### Connection Pooling

```typescript
// HTTP connection management
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 60000,
});
```

## Security Architecture

### Authentication Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Browser   │    │ Proxy Server │    │   Neptune   │
└─────────────┘    └──────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Request        │                   │
       ├──────────────────►│                   │
       │                   │ 2. Get AWS Creds │
       │                   ├──────────────────►│
       │                   │ 3. Sign Request  │
       │                   ├──────────────────►│
       │                   │ 4. Response      │
       │ 5. Response       │◄──────────────────┤
       │◄──────────────────┤                   │
```

### Data Security

#### Client-Side Security

- **No Sensitive Data Storage**: Credentials never stored in browser
- **HTTPS Enforcement**: All communication encrypted
- **CSP Headers**: Content Security Policy prevents XSS
- **Input Sanitization**: All user inputs sanitized

#### Server-Side Security

- **Credential Management**: AWS SDK handles credential rotation
- **Request Signing**: SigV4 signing for Neptune authentication
- **Error Handling**: Sensitive information not exposed in errors
- **CORS Configuration**: Proper cross-origin resource sharing

## Deployment Architecture

### Container Architecture

```dockerfile
# Multi-stage build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm build

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 80 443
CMD ["node", "dist/server.js"]
```

### Scaling Considerations

#### Horizontal Scaling

- **Stateless Design**: Multiple instances can run simultaneously
- **Load Balancing**: Standard HTTP load balancers work
- **Session Management**: No server-side sessions to manage
- **Database Connections**: Each instance manages its own connections

#### Vertical Scaling

- **Memory Usage**: Scales with concurrent connections
- **CPU Usage**: Primarily I/O bound operations
- **Network**: Bandwidth scales with user activity

## Monitoring and Observability

### Logging Architecture

```typescript
// Structured logging with Pino
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: label => ({ level: label }),
    bindings: bindings => ({ pid: bindings.pid, hostname: bindings.hostname }),
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});
```

### Health Monitoring

```typescript
// Health check endpoint
app.get("/status", (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
  };

  res.status(200).json(health);
});
```

### Error Tracking

```typescript
// Centralized error handling
class ErrorHandler {
  static handle(error: Error, req: Request, res: Response): void {
    logger.error(
      {
        err: error,
        req: req,
        stack: error.stack,
      },
      "Request error"
    );

    const statusCode = error.statusCode || 500;
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message;

    res.status(statusCode).json({ error: message });
  }
}
```

## Future Architecture Considerations

### Scalability Improvements

1. **Microservices**: Split into specialized services
2. **Caching Layer**: Add Redis for query result caching
3. **CDN Integration**: Serve static assets via CDN
4. **Database Sharding**: Support for multiple database connections

### Performance Enhancements

1. **WebAssembly**: Move graph algorithms to WASM
2. **Web Workers**: Offload heavy computations
3. **Streaming**: Real-time data updates via WebSockets
4. **Progressive Loading**: Lazy load graph components

### Security Enhancements

1. **OAuth Integration**: Support for OAuth providers
2. **RBAC**: Role-based access control
3. **Audit Logging**: Comprehensive audit trails
4. **Encryption**: End-to-end encryption for sensitive data

This architecture provides a solid foundation for graph data exploration while
maintaining flexibility for future enhancements and scaling requirements.
