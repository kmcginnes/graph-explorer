# Common Issues

This page contains workarounds for common issues and information on how to
diagnose other problems with Graph Explorer.

## Docker Container Issues

### Container Won't Start

If the container does not start, or immediately stops:

1. **Check container logs**:

   ```bash
   docker logs graph-explorer
   ```

2. **Common causes**:
   - Port conflicts (80/443 already in use)
   - Invalid environment variables
   - Insufficient system resources
   - Docker service not running

3. **Solutions**:

   ```bash
   # Check if ports are in use
   netstat -tlnp | grep :80
   netstat -tlnp | grep :443

   # Use different ports if needed
   docker run -p 8080:80 -p 8443:443 ...

   # Restart Docker service
   sudo systemctl restart docker
   ```

### Ports Already in Use

If the default ports of 80 and 443 are already in use, you can use the `-p` flag
to change the ports to something else. The host machine ports are the first of
the two numbers.

For example, if you want to use port 8080 and 4431:

```bash
docker run -p 8080:80 -p 4431:443 \
 --name graph-explorer \
 --env HOST=localhost \
 public.ecr.aws/neptune/graph-explorer
```

Which will result in the following URLs:

- HTTPS: `https://localhost:4431/explorer`
- HTTP: `http://localhost:8080/explorer`

### HTTP Only Configuration

If you do not want to use SSL and HTTPS, you can disable it by setting the
following environment variables:

```bash
docker run -p 80:80 \
  --name graph-explorer \
  --env PROXY_SERVER_HTTPS_CONNECTION=false \
  --env GRAPH_EXP_HTTPS_CONNECTION=false \
  public.ecr.aws/neptune/graph-explorer
```

## HTTPS Connections

If either Graph Explorer or the proxy-server are served over an HTTPS connection
(which it is by default), you will have to bypass the warning message from the
browser due to the included certificate being a self-signed certificate.

### Trusting Self-Signed Certificates

You can bypass by manually ignoring them from the browser or downloading the
correct certificate and configuring them to be trusted. Alternatively, you can
provide your own certificate.

The following instructions can be used as an example to bypass the warnings for
Chrome, but note that different browsers and operating systems will have
slightly different steps.

#### For Chrome/Edge (General Steps)

1. **Download the certificate** directly from the browser:
   - Click the "Not Secure" section on the left of the URL bar
   - Select "Certificate is not valid" to show the certificate
   - Click Details tab and click Export at the bottom

2. **Trust the certificate** on your machine:
   - **macOS**: Open Keychain Access app, select System under System Keychains,
     go to File > Import Items, import the certificate, then right-click and
     select "Get Info", expand Trust section, and change "When using this
     certificate" to "Always Trust"
   - **Windows**: Double-click the certificate file, click "Install
     Certificate", choose "Local Machine", select "Place all certificates in the
     following store", browse to "Trusted Root Certification Authorities"
   - **Linux**: Copy certificate to `/usr/local/share/ca-certificates/` and run
     `sudo update-ca-certificates`

3. **Refresh the browser** and you should be able to proceed to the application

<!-- prettier-ignore -->
> [!TIP]
> To get rid of the "Not Secure" warning completely, see the
[Using self-signed certificates on Chrome](../development/development-setup.md#using-self-signed-certificates-on-chrome) guide.

### Custom SSL Certificates

For production deployments, use proper SSL certificates:

1. **Let's Encrypt** (free):

   ```bash
   # Install certbot
   sudo apt-get install certbot

   # Generate certificate
   sudo certbot certonly --standalone -d your-domain.com

   # Mount in Docker
   docker run -v /etc/letsencrypt/live/your-domain.com:/certs ...
   ```

2. **Commercial Certificate**:
   - Purchase from a certificate authority
   - Mount certificate files in Docker container
   - Update environment variables accordingly

## Connection Issues

### Cannot Connect to Graph Database

1. **Network connectivity**:

   ```bash
   # Test basic connectivity
   telnet your-database-host 8182
   curl -v http://your-database-host:8182/status
   ```

2. **VPC and Security Groups** (for AWS):
   - Ensure Graph Explorer is in the same VPC as Neptune
   - Check security group rules allow traffic on port 8182
   - Verify route tables and NACLs

3. **Authentication issues**:
   - Verify AWS credentials are properly configured
   - Check IAM permissions for Neptune access
   - Ensure correct AWS region is specified

### Proxy Server Cannot Be Reached

Communication between the client and proxy server can be configured in different
ways. When Graph Explorer proxy server starts up it will print out its best
approximation of the correct public proxy server address.

**Common error types**:

- 404 not found responses
- Connection refused errors
- Timeout errors

**Troubleshooting steps**:

1. **Check proxy server configuration**:
   - Verify `PUBLIC_OR_PROXY_ENDPOINT` matches your browser URL
   - Ensure proxy server is running and accessible
   - Check firewall rules and network configuration

2. **Verify endpoint paths**:
   - Client is hosted at `/explorer` by default
   - Queries are handled via `/gremlin`, `/opencypher`, `/sparql`
   - Summary APIs are handled via `/summary`, `/pg/statistics/summary`,
     `/rdf/statistics/summary`
   - Logging is handled by `/logger`
   - Default connection is handled by `/defaultConnection`

<!-- prettier-ignore -->
> [!IMPORTANT]  
> The paths listed here could change in future versions. Check release notes for any path changes.

## Performance Issues

### Slow Loading or Timeouts

1. **Increase timeout values**:

   ```bash
   --env GRAPH_EXP_FETCH_REQUEST_TIMEOUT=600000  # 10 minutes
   ```

2. **Optimize queries**:
   - Use filters to limit result sets
   - Set appropriate node expansion limits
   - Avoid loading entire large datasets at once

3. **Check system resources**:

   ```bash
   # Monitor container resources
   docker stats graph-explorer

   # Check system memory and CPU
   htop
   free -h
   ```

### Memory Issues

1. **Increase container memory**:

   ```bash
   docker run --memory=4g --memory-swap=4g ...
   ```

2. **Optimize data loading**:
   - Use pagination for large datasets
   - Clear graph view periodically
   - Set reasonable expansion limits

### Browser Performance

1. **Clear browser cache and data**
2. **Disable browser extensions** that might interfere
3. **Use modern browsers** with good JavaScript performance
4. **Close other tabs** to free up memory

## Authentication and Permission Issues

### AWS IAM Authentication Failures

1. **Credential resolution**:

   ```bash
   # Check AWS credentials
   aws sts get-caller-identity

   # Verify region
   aws configure get region
   ```

2. **IAM permissions**:
   - Ensure role has Neptune read permissions
   - Check policy attachments and trust relationships
   - Verify service type matches (neptune-db vs neptune-graph)

3. **Network configuration**:
   - Ensure proxy server can reach AWS services
   - Check VPC endpoints if using private subnets
   - Verify security group rules

### Permission Denied Errors

1. **Check IAM policies**:

   ```json
   {
     "Effect": "Allow",
     "Action": ["neptune-db:ReadDataViaQuery", "neptune-db:GetGraphSummary"],
     "Resource": "arn:aws:neptune-db:*:*:cluster/*"
   }
   ```

2. **Verify resource ARNs** match your Neptune cluster
3. **Check condition statements** in policies

## Data and Schema Issues

### Schema Sync Failures

Schema synchronization can fail for several reasons:

#### Mismatched Proxy Server URL

Modern browsers enforce Same-Origin Policy, which requires API requests to be
sent to the same domain as the page you're viewing.

**Solution**:

1. Check your connection settings
2. Ensure the proxy server URL matches the domain portion of your current
   browser URL
3. Update the connection if necessary

**Example**:

```
# If browser URL is:
https://graph-explorer.mydomain.com/explorer/#/connections

# Connection proxy server URL should be:
https://graph-explorer.mydomain.com
```

#### Database Timeout Issues

**Sources of timeouts**:

- Database server limits
- Networking layer (load balancer, proxy, etc)
- Browser timeout limits
- Graph Explorer connection configuration

**Solutions**:

1. Increase timeout values in connection settings
2. Optimize database queries and indexes
3. Check network infrastructure for bottlenecks

#### Out of Memory

This can happen when your database is very large. Graph Explorer does its best
to support larger databases and is always improving.

**Workarounds**:

1. Use filters to limit data scope
2. Increase system memory allocation
3. Process data in smaller chunks
4. Consider database optimization

If you encounter persistent memory issues, please
[file an issue](https://github.com/aws/graph-explorer/issues/new/choose).

### Data Display Issues

1. **Missing or incorrect data**:
   - Verify database connectivity
   - Check query permissions
   - Ensure schema synchronization is complete

2. **Formatting problems**:
   - Check node/edge styling configuration
   - Verify display name and description attributes
   - Update namespace prefixes for RDF data

## Browser-Specific Issues

### Chrome Security Warnings

Chrome treats self-signed certificates differently than other browsers:

1. **Import root certificate** to system trust store
2. **Use proper domain names** instead of IP addresses
3. **Consider using HTTP** for development environments

### Firefox Connection Issues

1. **Clear SSL state**: Settings > Privacy & Security > Certificates > Clear
2. **Disable strict transport security** for development
3. **Check proxy settings** in Firefox preferences

### Safari Certificate Issues

1. **Keychain Access**: Import and trust certificates
2. **Developer menu**: Enable and check console for errors
3. **Privacy settings**: Ensure cookies and local storage are enabled

## Development Issues

### Build Failures

1. **Node version mismatch**:

   ```bash
   nvm use  # Use project's Node version
   node --version  # Verify version
   ```

2. **Dependency issues**:

   ```bash
   # Clear and reinstall
   rm -rf node_modules
   pnpm install

   # Clear pnpm cache
   pnpm store prune
   ```

3. **TypeScript errors**:

   ```bash
   # Check types
   pnpm check:types

   # Restart TypeScript server in VS Code
   # Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
   ```

### Hot Reload Not Working

1. **Check file watchers**:

   ```bash
   # Increase file watcher limit (Linux)
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Verify Vite configuration**
3. **Check for file permission issues**
4. **Restart development server**

## Getting Help

### Diagnostic Information

When reporting issues, include:

1. **System information**:
   - Operating system and version
   - Docker version
   - Browser and version
   - Node.js version (for development)

2. **Configuration**:
   - Environment variables (sanitized)
   - Connection settings (without credentials)
   - Docker run command used

3. **Error details**:
   - Complete error messages
   - Browser console logs
   - Container logs
   - Network request details

### Log Collection

```bash
# Container logs
docker logs graph-explorer > graph-explorer.log

# Browser console logs
# Open Developer Tools > Console > Right-click > Save as...

# System logs (Linux)
journalctl -u docker > docker.log
```

### Support Channels

1. **GitHub Issues**: For bug reports and feature requests
2. **GitHub Discussions**: For questions and community support
3. **Documentation**: Check all relevant documentation sections
4. **Stack Overflow**: Tag questions with `graph-explorer`

For additional specific troubleshooting guides, see:

- [Connection Problems](./2-connection-problems.md)
- [Performance Issues](./3-performance.md)
