# Docker Deployment

This guide covers production Docker deployment of Graph Explorer, including
configuration options and best practices.

## Production Docker Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
  (if using Neptune)
- Access to your graph database endpoint

### Basic Production Deployment

1. Authenticate with the Amazon ECR Public Registry:

   ```bash
   aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
   ```

2. Pull the latest production image:

   ```bash
   docker pull public.ecr.aws/neptune/graph-explorer
   ```

3. Run the container with production settings:
   ```bash
   docker run -d \
     --name graph-explorer \
     -p 80:80 -p 443:443 \
     --env HOST={your-domain.com} \
     --restart unless-stopped \
     public.ecr.aws/neptune/graph-explorer
   ```

### Custom Docker Build

If you need to build from source:

1. Clone the repository:

   ```bash
   git clone https://github.com/aws/graph-explorer.git
   cd graph-explorer
   ```

2. Build the production image:

   ```bash
   docker build -t graph-explorer .
   ```

3. Run your custom build:
   ```bash
   docker run -d \
     --name graph-explorer \
     -p 80:80 -p 443:443 \
     --env HOST={your-domain.com} \
     --restart unless-stopped \
     graph-explorer
   ```

## Configuration Options

### Environment Variables

Key environment variables for production deployment:

#### Required Variables

- `HOST`: The public hostname of the server (required for SSL certificate
  generation)

#### Connection Configuration

- `PUBLIC_OR_PROXY_ENDPOINT`: Public endpoint URL for the graph database
- `GRAPH_CONNECTION_URL`: Direct connection URL to the graph database
- `GRAPH_TYPE`: Graph type (`gremlin`, `sparql`, `openCypher`)
- `USING_PROXY_SERVER`: Whether to use proxy server (`true`/`false`)
- `IAM`: Enable AWS IAM authentication (`true`/`false`)
- `AWS_REGION`: AWS region for Neptune clusters
- `SERVICE_TYPE`: Service type (`neptune-db` or `neptune-graph`)

#### Server Configuration

- `GRAPH_EXP_HTTPS_CONNECTION`: Enable HTTPS for Graph Explorer (`true`/`false`)
- `PROXY_SERVER_HTTPS_CONNECTION`: Enable HTTPS for proxy server
  (`true`/`false`)
- `PROXY_SERVER_HTTPS_PORT`: HTTPS port (default: `443`)
- `PROXY_SERVER_HTTP_PORT`: HTTP port (default: `80`)
- `GRAPH_EXP_FETCH_REQUEST_TIMEOUT`: Request timeout in milliseconds (default:
  `240000`)
- `GRAPH_EXP_NODE_EXPANSION_LIMIT`: Node expansion limit (default: none)

### Default Connection Configuration

#### Using Environment Variables

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
  --restart unless-stopped \
  public.ecr.aws/neptune/graph-explorer
```

#### Using JSON Configuration

1. Create a `config.json` file:

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
     "GRAPH_EXP_FETCH_REQUEST_TIMEOUT": 240000,
     "GRAPH_EXP_NODE_EXPANSION_LIMIT": 500
   }
   ```

2. Mount the configuration file:
   ```bash
   docker run -d \
     --name graph-explorer \
     -p 80:80 -p 443:443 \
     --env HOST=graph-explorer.example.com \
     -v /path/to/config.json:/graph-explorer/config.json \
     --restart unless-stopped \
     public.ecr.aws/neptune/graph-explorer
   ```

## SSL/TLS Configuration

### Self-Signed Certificates

Graph Explorer includes self-signed certificates by default. The `HOST`
environment variable is used to generate certificates that match your domain.

### Custom Certificates

To use your own SSL certificates:

1. Prepare your certificate files:
   - `server.crt`: Your SSL certificate
   - `server.key`: Your private key
   - `rootCA.crt`: Your root CA certificate (optional)

2. Mount the certificates:
   ```bash
   docker run -d \
     --name graph-explorer \
     -p 80:80 -p 443:443 \
     --env HOST=graph-explorer.example.com \
     -v /path/to/certs:/graph-explorer/packages/graph-explorer-proxy-server/cert-info \
     --restart unless-stopped \
     public.ecr.aws/neptune/graph-explorer
   ```

### HTTP-Only Deployment

For development or internal use, you can disable HTTPS:

```bash
docker run -d \
  --name graph-explorer \
  -p 80:80 \
  --env PROXY_SERVER_HTTPS_CONNECTION=false \
  --env GRAPH_EXP_HTTPS_CONNECTION=false \
  --restart unless-stopped \
  public.ecr.aws/neptune/graph-explorer
```

## Production Best Practices

### Resource Management

1. **Memory Allocation**: Ensure adequate memory for large graph operations
2. **CPU Resources**: Allocate sufficient CPU for graph processing
3. **Storage**: Consider persistent storage for configuration and logs

### Monitoring and Logging

1. **Health Checks**: Use the `/status` endpoint for health monitoring
2. **Log Management**: Configure log aggregation for production monitoring
3. **Metrics**: Monitor container resource usage and application performance

### Security Considerations

1. **Network Security**: Use proper firewall rules and network segmentation
2. **Access Control**: Implement authentication and authorization
3. **Certificate Management**: Use proper SSL certificates for production
4. **Regular Updates**: Keep the Docker image updated with security patches

### High Availability

1. **Container Orchestration**: Consider using Docker Swarm or Kubernetes
2. **Load Balancing**: Implement load balancing for multiple instances
3. **Backup Strategy**: Backup configuration and important data
4. **Disaster Recovery**: Plan for disaster recovery scenarios

## Docker Compose Example

For more complex deployments, use Docker Compose:

```yaml
version: "3.8"
services:
  graph-explorer:
    image: public.ecr.aws/neptune/graph-explorer
    ports:
      - "80:80"
      - "443:443"
    environment:
      - HOST=graph-explorer.example.com
      - PUBLIC_OR_PROXY_ENDPOINT=https://graph-explorer.example.com
      - GRAPH_TYPE=gremlin
      - USING_PROXY_SERVER=true
      - IAM=true
      - GRAPH_CONNECTION_URL=https://cluster-id.us-west-2.neptune.amazonaws.com:8182
      - AWS_REGION=us-west-2
      - SERVICE_TYPE=neptune-db
    volumes:
      - ./config.json:/graph-explorer/config.json
      - ./certs:/graph-explorer/packages/graph-explorer-proxy-server/cert-info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/status"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Troubleshooting

### Common Docker Issues

1. **Port Conflicts**: Ensure ports 80 and 443 are available
2. **Permission Issues**: Check file permissions for mounted volumes
3. **Memory Issues**: Increase Docker memory limits if needed
4. **Network Issues**: Verify network connectivity to graph databases

### Container Logs

View container logs for debugging:

```bash
# View recent logs
docker logs graph-explorer

# Follow logs in real-time
docker logs -f graph-explorer

# View logs with timestamps
docker logs -t graph-explorer
```

For additional troubleshooting, see the
[Common Issues](../troubleshooting/1-common-issues.md) guide.
