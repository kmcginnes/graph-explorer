# Configuration

This guide covers environment variables, configuration options, and advanced
settings for Graph Explorer deployments.

## Environment Variables

### Application Configuration

#### `GRAPH_EXP_ENV_ROOT_FOLDER`

Base path used to serve the `graph-explorer` front end application.

- **Type**: `string`
- **Default**: `/`
- **Example**: `/explorer`
- **Optional**: Yes

#### `GRAPH_EXP_CONNECTION_NAME`

Default connection name.

- **Type**: `string`
- **Default**: Empty
- **Optional**: Yes

#### `GRAPH_EXP_CONNECTION_ENGINE`

The query engine to use for the default connection.

- **Type**: `string`
- **Default**: `gremlin`
- **Valid values**: `gremlin`, `openCypher`, `sparql`
- **Optional**: Yes

### Server Configuration

#### `HOST`

The public hostname of the server. This is used to generate the SSL certificate
during the Docker build.

- **Type**: `string`
- **Default**: Empty
- **Example**: `localhost`, `graph-explorer.example.com`
- **Required**: When using HTTPS connections

#### `GRAPH_EXP_HTTPS_CONNECTION`

Uses the self-signed certificate to serve Graph Explorer over HTTPS if true.

- **Type**: `boolean`
- **Default**: `true`
- **Optional**: Yes

#### `PROXY_SERVER_HTTPS_PORT`

The port to use for the HTTPS server.

- **Type**: `number`
- **Default**: `443`
- **Optional**: Yes

#### `PROXY_SERVER_HTTP_PORT`

The port to use for the HTTP server.

- **Type**: `number`
- **Default**: `80`
- **Optional**: Yes

#### `PROXY_SERVER_HTTPS_CONNECTION`

Uses the self-signed certificate to serve the proxy-server over HTTPS if true.

- **Type**: `boolean`
- **Default**: `true`
- **Optional**: Yes

### Default Connection Configuration

#### Required Variables

##### `PUBLIC_OR_PROXY_ENDPOINT`

The publicly accessible endpoint URL for Graph Explorer.

- **Type**: `string`
- **Default**: None
- **Required**: Yes
- **Example**: `https://graph-explorer.example.com`

#### Optional Variables

##### `GRAPH_TYPE`

The graph type for the default connection.

- **Type**: `string`
- **Default**: None
- **Valid values**: `gremlin`, `sparql`, `openCypher`
- **Note**: If not specified, multiple connections will be created for every
  available graph type

##### `USING_PROXY_SERVER`

Whether to use a proxy server for the connection.

- **Type**: `boolean`
- **Default**: `false`
- **Optional**: Yes

##### `IAM`

Enable AWS IAM authentication.

- **Type**: `boolean`
- **Default**: `false`
- **Optional**: Yes

##### `GRAPH_EXP_FETCH_REQUEST_TIMEOUT`

Controls the timeout for fetch requests.

- **Type**: `number`
- **Default**: `240000`
- **Unit**: Milliseconds (240000 = 240 seconds = 4 minutes)
- **Optional**: Yes

##### `GRAPH_EXP_NODE_EXPANSION_LIMIT`

Controls the limit for node counts and expansion queries.

- **Type**: `number`
- **Default**: None
- **Optional**: Yes

#### Conditionally Required Variables

##### When `USING_PROXY_SERVER=true`

###### `GRAPH_CONNECTION_URL`

The direct connection URL to the graph database.

- **Type**: `string`
- **Default**: None
- **Required**: When using proxy server
- **Example**: `https://cluster-id.us-west-2.neptune.amazonaws.com:8182`

##### When `USING_PROXY_SERVER=true` and `IAM=true`

###### `AWS_REGION`

The AWS region where the Neptune cluster is located.

- **Type**: `string`
- **Default**: None
- **Required**: When using IAM authentication
- **Example**: `us-west-2`

###### `SERVICE_TYPE`

The type of Neptune service.

- **Type**: `string`
- **Default**: `neptune-db`
- **Valid values**: `neptune-db`, `neptune-graph`
- **Required**: When using IAM authentication

## Configuration Methods

### Environment Variables Method

Set environment variables directly in your Docker run command:

```bash
docker run -d \
  --name graph-explorer \
  -p 80:80 -p 443:443 \
  --env HOST=graph-explorer.example.com \
  --env PUBLIC_OR_PROXY_ENDPOINT=https://graph-explorer.example.com \
  --env GRAPH_TYPE=gremlin \
  --env USING_PROXY_SERVER=true \
  --env IAM=true \
  --env GRAPH_CONNECTION_URL=https://cluster-id.us-west-2.neptune.amazonaws.com:8182 \
  --env AWS_REGION=us-west-2 \
  --env SERVICE_TYPE=neptune-db \
  --env GRAPH_EXP_FETCH_REQUEST_TIMEOUT=300000 \
  --env GRAPH_EXP_NODE_EXPANSION_LIMIT=1000 \
  public.ecr.aws/neptune/graph-explorer
```

### JSON Configuration Method

Create a `config.json` file with your configuration:

```json
{
  "PUBLIC_OR_PROXY_ENDPOINT": "https://graph-explorer.example.com",
  "GRAPH_CONNECTION_URL": "https://cluster-id.us-west-2.neptune.amazonaws.com:8182",
  "USING_PROXY_SERVER": true,
  "IAM": true,
  "SERVICE_TYPE": "neptune-db",
  "AWS_REGION": "us-west-2",
  "GRAPH_TYPE": "gremlin",
  "GRAPH_EXP_HTTPS_CONNECTION": true,
  "PROXY_SERVER_HTTPS_CONNECTION": true,
  "GRAPH_EXP_FETCH_REQUEST_TIMEOUT": 300000,
  "GRAPH_EXP_NODE_EXPANSION_LIMIT": 1000
}
```

Mount the configuration file:

```bash
docker run -d \
  --name graph-explorer \
  -p 80:80 -p 443:443 \
  --env HOST=graph-explorer.example.com \
  -v /path/to/config.json:/graph-explorer/config.json \
  public.ecr.aws/neptune/graph-explorer
```

### Environment File Method

Create a `.env` file:

```env
HOST=graph-explorer.example.com
PUBLIC_OR_PROXY_ENDPOINT=https://graph-explorer.example.com
GRAPH_TYPE=gremlin
USING_PROXY_SERVER=true
IAM=true
GRAPH_CONNECTION_URL=https://cluster-id.us-west-2.neptune.amazonaws.com:8182
AWS_REGION=us-west-2
SERVICE_TYPE=neptune-db
GRAPH_EXP_FETCH_REQUEST_TIMEOUT=300000
GRAPH_EXP_NODE_EXPANSION_LIMIT=1000
```

Use with Docker:

```bash
docker run -d \
  --name graph-explorer \
  -p 80:80 -p 443:443 \
  --env-file .env \
  public.ecr.aws/neptune/graph-explorer
```

## Advanced Configuration

### SSL Certificate Configuration

#### Self-Signed Certificates

Graph Explorer automatically generates self-signed certificates using the `HOST`
environment variable. The certificates are created during container startup.

#### Custom Certificates

To use your own SSL certificates, mount them to the appropriate directory:

```bash
docker run -d \
  --name graph-explorer \
  -p 80:80 -p 443:443 \
  --env HOST=graph-explorer.example.com \
  -v /path/to/your/certs:/graph-explorer/packages/graph-explorer-proxy-server/cert-info \
  public.ecr.aws/neptune/graph-explorer
```

Required certificate files:

- `server.crt`: SSL certificate
- `server.key`: Private key
- `rootCA.crt`: Root CA certificate (optional)

### Logging Configuration

#### Log Level

Set the log level using the `LOG_LEVEL` environment variable:

```bash
--env LOG_LEVEL=debug
```

Available log levels (from highest to lowest):

- `error`
- `warn`
- `info` (default)
- `debug`
- `trace`

#### Log Output

Logs are sent to the console by default and can be viewed using:

```bash
docker logs graph-explorer
```

For structured logging in production, consider using log drivers:

```bash
docker run -d \
  --name graph-explorer \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  -p 80:80 -p 443:443 \
  public.ecr.aws/neptune/graph-explorer
```

### Performance Tuning

#### Memory Configuration

For large graphs, increase container memory limits:

```bash
docker run -d \
  --name graph-explorer \
  --memory=4g \
  --memory-swap=4g \
  -p 80:80 -p 443:443 \
  public.ecr.aws/neptune/graph-explorer
```

#### Request Timeout Configuration

Adjust timeouts for large queries:

```bash
--env GRAPH_EXP_FETCH_REQUEST_TIMEOUT=600000  # 10 minutes
```

#### Node Expansion Limits

Set reasonable limits to prevent overwhelming the UI:

```bash
--env GRAPH_EXP_NODE_EXPANSION_LIMIT=500
```

### Health Check Configuration

Configure health checks for monitoring:

```bash
docker run -d \
  --name graph-explorer \
  --health-cmd="curl -f http://localhost/status || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  -p 80:80 -p 443:443 \
  public.ecr.aws/neptune/graph-explorer
```

## Configuration Validation

### Testing Configuration

After deployment, verify your configuration:

1. **Health Check**: `curl http://localhost/status`
2. **Connection Test**: Access the Graph Explorer UI and test connections
3. **Log Review**: Check container logs for any configuration errors

### Common Configuration Issues

1. **Missing HOST variable**: Results in SSL certificate errors
2. **Incorrect AWS_REGION**: Causes IAM authentication failures
3. **Wrong SERVICE_TYPE**: Leads to Neptune connection issues
4. **Invalid JSON**: Causes configuration parsing errors

### Configuration Best Practices

1. **Use environment-specific configurations**: Separate dev, staging, and
   production configs
2. **Secure sensitive data**: Use Docker secrets or external secret management
3. **Document configurations**: Maintain clear documentation of all settings
4. **Version control**: Store configuration files in version control
5. **Validate before deployment**: Test configurations in staging environments

For troubleshooting configuration issues, see the
[Common Issues](../troubleshooting/1-common-issues.md) guide.
