# Development Setup

This guide covers setting up a local development environment for Graph Explorer,
including requirements, configuration, and development workflows.

## Requirements

### System Requirements

- **pnpm** >=10.12.1
- **Node.js** >=24.4.0
- **Git** for version control
- **Docker** (optional, for testing deployments)

### Node Version Management

Ensure you are running the correct Node version. If you are using
[NVM](https://github.com/nvm-sh/nvm), you can simply do:

```bash
nvm use
```

Otherwise, use whatever method you use to install
[Node v24.4.0](https://nodejs.org/en/download).

### Package Manager Setup

[Corepack](https://nodejs.org/api/corepack.html) is used to ensure the package
manager used for the project is consistent.

```bash
corepack enable
```

## Project Structure

The project follows a monorepo structure with three main packages:

```
graph-explorer/
├── packages/
│   ├── graph-explorer/           # React frontend application
│   ├── graph-explorer-proxy-server/  # Express.js backend server
│   └── shared/                   # Shared types and utilities
├── additionaldocs/               # Documentation
├── samples/                      # Example configurations
└── [root config files]           # Workspace-level configuration
```

## Development Environment Setup

### Initial Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/aws/graph-explorer.git
   cd graph-explorer
   ```

2. **Enable Corepack**:

   ```bash
   corepack enable
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

### Development Servers

Start the development servers for both frontend and backend:

```bash
pnpm dev
```

Launch your web browser and navigate to:

```
http://localhost:5173
```

At this point, Graph Explorer should be successfully running and asking for
connection details for your database. See the
[First Connection Guide](../getting-started/2-first-connection.md) to configure
your first database connection.

## Build Process

### Production Build

Building Graph Explorer for production:

```bash
pnpm install
pnpm build
```

This will run the build across both the client code and the proxy server code.
You'll end up with two `dist` folders:

```
{ROOT_PATH}/packages/graph-explorer/dist/
{ROOT_PATH}/packages/graph-explorer-proxy-server/dist/
```

### Running Production Build

To serve the production build, use the proxy server:

```bash
pnpm start
```

This starts the Express.js proxy server which serves the built frontend
application and handles backend API requests.

## Development Workflows

### Code Quality Checks

Run all quality checks before committing:

```bash
# Run all checks (recommended)
pnpm checks

# Individual checks
pnpm check:types      # TypeScript type checking
pnpm check:lint       # ESLint checking
pnpm check:format     # Prettier format checking
pnpm test             # Run tests
pnpm coverage         # Generate coverage report
```

### Fixing Issues

Automatically fix linting and formatting issues:

```bash
pnpm lint             # Fix ESLint issues
pnpm format           # Fix Prettier formatting
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Generate coverage report
pnpm coverage
```

## Dependency Management

### Adding Dependencies

Add dependencies to specific packages using the `--filter` flag:

```bash
# Adding a package for the react app
pnpm add react --filter graph-explorer

# Adding a dev dependency for the server app
pnpm add -D vitest --filter graph-explorer-proxy-server

# Adding to shared package
pnpm add lodash --filter shared
```

### Workspace Dependencies

To add dependencies between workspace packages:

```bash
# Add shared package to graph-explorer
pnpm add @graph-explorer/shared --filter graph-explorer --workspace
```

### Updating Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update react --filter graph-explorer
```

## Environment Configuration

### Environment Variables

Create a `.env` file in the appropriate package directory for local development:

#### Frontend Environment (`packages/graph-explorer/.env`)

```env
# Development settings
VITE_API_URL=http://localhost:3000
VITE_LOG_LEVEL=debug
```

#### Backend Environment (`packages/graph-explorer-proxy-server/.env`)

```env
# Server configuration
PORT=3000
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173

# Graph database connection (optional for development)
GRAPH_CONNECTION_URL=http://localhost:8182
AWS_REGION=us-west-2
```

### Key Environment Variables

#### Frontend Variables

- `VITE_API_URL`: Backend API URL for development
- `VITE_LOG_LEVEL`: Client-side logging level

#### Backend Variables

- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Server logging level (`error`, `warn`, `info`, `debug`, `trace`)
- `CORS_ORIGIN`: Allowed CORS origins for development

## Development Tools

### IDE Configuration

#### VS Code

Recommended VS Code extensions:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Git Hooks

The project uses Husky for Git hooks:

- **Pre-commit**: Runs lint-staged to check staged files
- **Pre-push**: Runs type checking and tests

Hooks are automatically installed when you run `pnpm install`.

## Debugging

### Frontend Debugging

1. **Browser DevTools**: Use React Developer Tools extension
2. **Console Logging**: Use `console.log` for debugging (remove before
   committing)
3. **Network Tab**: Monitor API requests to the backend
4. **React Query DevTools**: Inspect query state and cache

### Backend Debugging

1. **Console Logging**: Use the Pino logger for structured logging
2. **Node Inspector**: Use `--inspect` flag for debugging
3. **Postman/curl**: Test API endpoints directly

### Debug Configuration

#### VS Code Launch Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Frontend",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/packages/graph-explorer/src"
    },
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/graph-explorer-proxy-server/src/node-server.ts",
      "outFiles": [
        "${workspaceFolder}/packages/graph-explorer-proxy-server/dist/**/*.js"
      ],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## Docker Development

### Local Docker Build

For testing Docker builds locally:

```bash
# Build the Docker image
docker build -t graph-explorer-dev .

# Run the container
docker run -p 80:80 -p 443:443 \
  --env HOST=localhost \
  --env PROXY_SERVER_HTTPS_CONNECTION=false \
  --env GRAPH_EXP_HTTPS_CONNECTION=false \
  graph-explorer-dev
```

### Docker Compose for Development

Create a `docker-compose.dev.yml` for development:

```yaml
version: "3.8"
services:
  graph-explorer:
    build: .
    ports:
      - "80:80"
      - "443:443"
    environment:
      - HOST=localhost
      - PROXY_SERVER_HTTPS_CONNECTION=false
      - GRAPH_EXP_HTTPS_CONNECTION=false
    volumes:
      - ./packages/graph-explorer/src:/app/packages/graph-explorer/src
      - ./packages/graph-explorer-proxy-server/src:/app/packages/graph-explorer-proxy-server/src
```

## Performance Optimization

### Development Performance

1. **Hot Module Replacement**: Enabled by default in Vite
2. **TypeScript Incremental**: Configured for faster type checking
3. **ESLint Cache**: Enabled to speed up linting
4. **Test Watch Mode**: Use `pnpm test --watch` for faster feedback

### Build Performance

1. **Parallel Builds**: pnpm runs package builds in parallel
2. **Incremental TypeScript**: Faster subsequent builds
3. **Vite Optimization**: Tree shaking and code splitting
4. **Docker Layer Caching**: Optimize Dockerfile for layer caching

## Troubleshooting

### Common Development Issues

1. **Port Already in Use**:

   ```bash
   # Find process using port
   lsof -i :5173
   # Kill process
   kill -9 <PID>
   ```

2. **Node Version Mismatch**:

   ```bash
   # Check current version
   node --version
   # Use correct version
   nvm use
   ```

3. **Package Installation Issues**:

   ```bash
   # Clear cache and reinstall
   pnpm store prune
   rm -rf node_modules
   pnpm install
   ```

4. **TypeScript Errors**:

   ```bash
   # Restart TypeScript server in VS Code
   # Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"

   # Or run type check manually
   pnpm check:types
   ```

### Performance Issues

1. **Slow Development Server**:
   - Check for large files in src directory
   - Ensure proper .gitignore configuration
   - Consider excluding large directories from file watchers

2. **Memory Issues**:
   - Increase Node.js memory limit: `NODE_OPTIONS="--max-old-space-size=4096"`
   - Close unnecessary applications
   - Use `pnpm prune` to remove unused dependencies

### Getting Help

- **Documentation**: Check this guide and other documentation
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for help in pull request comments

For additional troubleshooting, see the
[Common Issues](../troubleshooting/common-issues.md) guide.
