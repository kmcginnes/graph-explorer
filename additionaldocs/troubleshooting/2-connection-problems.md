# Connection Problems

This guide covers troubleshooting connection issues between Graph Explorer and
various graph databases.

## General Connection Troubleshooting

### Basic Connectivity Tests

Before diving into specific issues, verify basic connectivity:

```bash
# Test network connectivity to your database
telnet your-database-host 8182

# Test HTTP connectivity
curl -v http://your-database-host:8182/status

# For HTTPS endpoints
curl -v https://your-database-host:8182/status
```

### Connection Configuration Checklist

Verify your connection settings:

- [ ] **Endpoint URL** is correct and accessible
- [ ] **Port** is correct (typically 8182 for graph databases)
- [ ] **Protocol** matches (HTTP vs HTTPS)
- [ ] **Authentication** settings are properly configured
- [ ] **Network access** is allowed (VPC, security groups, firewalls)

## Neptune Connection Issues

### VPC and Network Configuration

#### Same VPC Requirement

Graph Explorer must have network access to Neptune:

1. **Same VPC**: Deploy Graph Explorer in the same VPC as Neptune
2. **VPC Peering**: Set up VPC peering between different VPCs
3. **Transit Gateway**: Use for complex multi-VPC scenarios

#### Security Group Configuration

**Neptune Security Group** (inbound rules):

```
Type: Custom TCP
Port: 8182
Source: Graph Explorer security group ID
```

**Graph Explorer Security Group** (outbound rules):

```
Type: Custom TCP
Port: 8182
Destination: Neptune security group ID
```

#### Subnet Configuration

- **Public Subnets**: For Graph Explorer if internet access needed
- **Private Subnets**: For Neptune (recommended for security)
- **Route Tables**: Ensure proper routing between subnets

### IAM Authentication Issues

#### Credential Resolution Problems

1. **Check AWS credentials**:

   ```bash
   # Verify credentials are available
   aws sts get-caller-identity

   # Check configured region
   aws configure get region
   ```

2. **Credential provider chain order**:
   - Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
   - IAM roles for EC2 instances
   - IAM roles for ECS tasks
   - AWS credentials file
   - Other AWS SDK credential sources

#### IAM Permission Issues

**Minimum required permissions**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "neptune-db:ReadDataViaQuery",
        "neptune-db:GetGraphSummary",
        "neptune-db:CancelQuery"
      ],
      "Resource": "arn:aws:neptune-db:REGION:ACCOUNT:cluster/CLUSTER-ID/*"
    }
  ]
}
```

**For Neptune Analytics**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "neptune-graph:ReadDataViaQuery",
        "neptune-graph:GetGraphSummary",
        "neptune-graph:CancelQuery"
      ],
      "Resource": "arn:aws:neptune-graph:REGION:ACCOUNT:graph/GRAPH-ID"
    }
  ]
}
```

#### Common IAM Errors

1. **Access Denied**:
   - Verify IAM policy is attached to the correct role
   - Check resource ARNs match your Neptune cluster
   - Ensure no deny statements override permissions

2. **Invalid Signature**:
   - Verify AWS region matches Neptune cluster region
   - Check system clock synchronization
   - Ensure credentials are not expired

3. **Service Type Mismatch**:
   - Use `neptune-db` for Neptune Database
   - Use `neptune-graph` for Neptune Analytics

### Neptune Endpoint Configuration

#### Cluster vs Reader Endpoints

- **Cluster Endpoint**: For read/write operations
- **Reader Endpoint**: For read-only operations (recommended for Graph Explorer)

#### Port Configuration

- **Standard Port**: 8182 for both HTTP and HTTPS
- **Protocol**: Neptune supports both HTTP and HTTPS

#### Example Neptune Connection

```json
{
  "name": "My Neptune Cluster",
  "graphType": "gremlin",
  "publicOrProxyEndpoint": "https://my-proxy-server.com",
  "usingProxyServer": true,
  "graphConnectionUrl": "https://my-cluster.cluster-xyz.us-west-2.neptune.amazonaws.com:8182",
  "awsIamAuthEnabled": true,
  "awsRegion": "us-west-2",
  "serviceType": "neptune-db"
}
```

## Gremlin Server Connection Issues

### Server Configuration

#### Enable REST Support

Graph Explorer requires HTTP REST support. Ensure your Gremlin Server is
configured with an appropriate channelizer:

```yaml
# gremlin-server.yaml
channelizer: org.apache.tinkerpop.gremlin.server.channel.HttpChannelizer
```

#### Configuration File Location

The Gremlin Server configuration is typically found at:

```
/conf/gremlin-server.yaml
```

### Version Compatibility

#### Gremlin Server 3.7+

Modern versions work out of the box with Graph Explorer.

#### Gremlin Server < 3.7

For older versions, make these changes:

1. **Enable property returns**: Remove
   `.withStrategies(ReferenceElementStrategy)` from
   `/scripts/generate-modern.groovy`

2. **Enable string IDs**: In `/conf/tinkergraph-empty.properties`:
   ```properties
   gremlin.tinkergraph.vertexIdManager=ANY
   gremlin.tinkergraph.edgeIdManager=ANY
   ```

### Docker Setup

```bash
# Pull and run Gremlin Server
docker pull tinkerpop/gremlin-server:latest
docker run -p 8182:8182 \
    tinkerpop/gremlin-server:latest \
    conf/gremlin-server-rest-modern.yaml
```

### Connection Configuration

```json
{
  "name": "Gremlin Server",
  "graphType": "gremlin",
  "publicOrProxyEndpoint": "http://localhost:8182",
  "usingProxyServer": false,
  "awsIamAuthEnabled": false
}
```

## SPARQL Endpoint Connection Issues

### BlazeGraph Configuration

#### Docker Network Setup

When using Docker containers, ensure proper networking:

```bash
# Create a Docker network
docker network create graph-network

# Run BlazeGraph
docker run -d --name blazegraph \
    --network graph-network \
    -p 9999:9999 \
    blazegraph/blazegraph:latest

# Run Graph Explorer
docker run -d --name graph-explorer \
    --network graph-network \
    -p 80:80 \
    public.ecr.aws/neptune/graph-explorer
```

#### Connection Configuration

```json
{
  "name": "BlazeGraph",
  "graphType": "sparql",
  "publicOrProxyEndpoint": "http://blazegraph:9999/blazegraph/sparql",
  "usingProxyServer": false,
  "awsIamAuthEnabled": false
}
```

### Other SPARQL Endpoints

#### Apache Jena Fuseki

```bash
# Run Fuseki
docker run -d --name fuseki \
    -p 3030:3030 \
    stain/jena-fuseki

# Connection URL
http://localhost:3030/dataset/sparql
```

#### GraphDB

```bash
# Connection URL format
http://localhost:7200/repositories/your-repository
```

## Proxy Server Issues

### Proxy Configuration Problems

#### URL Mismatch

Ensure the proxy server URL in your connection settings matches your browser URL
domain:

```
# Browser URL
https://graph-explorer.example.com/explorer

# Connection proxy server URL should be
https://graph-explorer.example.com
```

#### Same-Origin Policy

Modern browsers enforce Same-Origin Policy. The proxy server must be on the same
domain as the Graph Explorer frontend.

### Proxy Server Logs

Check proxy server logs for detailed error information:

```bash
# Docker container logs
docker logs graph-explorer

# Look for specific error patterns
docker logs graph-explorer 2>&1 | grep -i error
docker logs graph-explorer 2>&1 | grep -i connection
```

### Common Proxy Errors

1. **404 Not Found**:
   - Verify proxy server is running
   - Check endpoint paths are correct
   - Ensure load balancer/reverse proxy configuration

2. **Connection Refused**:
   - Verify proxy server is accessible
   - Check firewall rules
   - Ensure correct ports are exposed

3. **Timeout Errors**:
   - Increase timeout values
   - Check network latency
   - Verify database server is responsive

## SSL/TLS Connection Issues

### Certificate Problems

#### Self-Signed Certificates

For development environments using self-signed certificates:

1. **Trust the certificate** in your browser
2. **Import certificate** to system trust store
3. **Use HTTP** for development if HTTPS causes issues

#### Certificate Validation Errors

```bash
# Test SSL connection
openssl s_client -connect your-host:443 -servername your-host

# Check certificate details
curl -vI https://your-host/
```

### Mixed Content Issues

Ensure consistent protocol usage:

- If Graph Explorer is served over HTTPS, database connections should also use
  HTTPS
- Avoid mixing HTTP and HTTPS in the same application

## Timeout and Performance Issues

### Connection Timeouts

#### Increase Timeout Values

```bash
# Environment variable approach
--env GRAPH_EXP_FETCH_REQUEST_TIMEOUT=600000  # 10 minutes

# Connection-specific timeout
{
  "fetchTimeout": 600000
}
```

#### Network Latency

1. **Check network path**:

   ```bash
   traceroute your-database-host
   ping your-database-host
   ```

2. **Optimize network configuration**:
   - Use same availability zone
   - Consider VPC endpoints
   - Optimize security group rules

### Query Performance

#### Large Result Sets

1. **Use pagination** for large datasets
2. **Apply filters** to limit results
3. **Set expansion limits** appropriately

#### Database Optimization

1. **Index optimization** for frequently queried properties
2. **Query optimization** for complex traversals
3. **Resource allocation** for database servers

## Debugging Connection Issues

### Enable Debug Logging

```bash
# Enable debug logging
--env LOG_LEVEL=debug

# Check logs for detailed information
docker logs graph-explorer
```

### Browser Developer Tools

1. **Network Tab**: Monitor HTTP requests and responses
2. **Console**: Check for JavaScript errors
3. **Security Tab**: Verify SSL certificate status

### Connection Testing Tools

```bash
# Test HTTP connectivity
curl -v -X POST http://your-endpoint/gremlin \
  -H "Content-Type: application/json" \
  -d '{"gremlin": "g.V().limit(1)"}'

# Test SPARQL connectivity
curl -v -X POST http://your-endpoint/sparql \
  -H "Content-Type: application/sparql-query" \
  -d 'SELECT * WHERE { ?s ?p ?o } LIMIT 1'
```

### Network Diagnostics

```bash
# Check DNS resolution
nslookup your-database-host

# Test port connectivity
nc -zv your-database-host 8182

# Check routing
ip route get your-database-host
```

## Getting Help

### Information to Collect

When seeking help with connection issues, provide:

1. **Connection configuration** (sanitized, no credentials)
2. **Error messages** from browser console and container logs
3. **Network configuration** details (VPC, security groups, etc.)
4. **Database type and version**
5. **Graph Explorer version**
6. **Deployment method** (Docker, ECS, EC2, etc.)

### Diagnostic Commands

```bash
# System information
docker --version
docker logs graph-explorer
curl -I http://localhost/status

# Network information
netstat -tlnp | grep :80
ss -tlnp | grep :443
```

### Support Resources

- **GitHub Issues**: For bug reports with connection problems
- **Documentation**: Check deployment and configuration guides
- **Community**: Use GitHub Discussions for troubleshooting help

For additional troubleshooting, see:

- [Common Issues](./1-common-issues.md)
- [Performance Issues](./3-performance.md)
- [AWS EC2 Deployment](../deployment/2-aws-ec2.md)
- [Configuration Guide](../deployment/5-configuration.md)
