# Performance Optimization

This guide covers performance optimization techniques for Graph Explorer,
including client-side, server-side, and database-level optimizations.

## Client-Side Performance

### Browser Optimization

#### Memory Management

1. **Clear graph view periodically**:
   - Use the "Clear" button to remove nodes from visualization
   - Avoid loading entire large datasets at once
   - Use filters to limit displayed data

2. **Browser resource management**:

   ```javascript
   // Monitor memory usage in browser console
   console.log(performance.memory);

   // Clear browser cache periodically
   // Chrome: Settings > Privacy > Clear browsing data
   ```

3. **Close unnecessary browser tabs** to free up memory

#### Graph Visualization Performance

1. **Node and edge limits**:

   ```bash
   # Set reasonable expansion limits
   --env GRAPH_EXP_NODE_EXPANSION_LIMIT=500
   ```

2. **Layout optimization**:
   - Use simpler layouts for large graphs (Grid, Circle)
   - Avoid force-directed layouts for very large datasets
   - Disable animations for better performance

3. **Styling optimization**:
   - Minimize complex SVG icons
   - Use simple colors instead of gradients
   - Reduce edge styling complexity

### Data Loading Strategies

#### Progressive Loading

1. **Start small**: Begin with specific nodes rather than broad queries
2. **Use search filters**: Apply filters before loading data
3. **Expand incrementally**: Use neighbor expansion instead of loading large
   subgraphs

#### Pagination and Limits

```javascript
// Example query with limits
g.V().hasLabel("Person").limit(100);

// Use pagination for large result sets
g.V().hasLabel("Person").range(0, 100); // First 100
g.V().hasLabel("Person").range(100, 200); // Next 100
```

### UI Performance

#### Component Optimization

1. **Table view performance**:
   - Use column filtering to reduce displayed data
   - Enable pagination for large datasets
   - Hide unnecessary columns

2. **Search performance**:
   - Use specific search criteria
   - Avoid wildcard searches on large datasets
   - Cancel long-running queries when needed

## Server-Side Performance

### Container Resource Allocation

#### Memory Configuration

```bash
# Increase container memory for large graphs
docker run --memory=4g --memory-swap=4g \
  --name graph-explorer \
  public.ecr.aws/neptune/graph-explorer
```

#### CPU Configuration

```bash
# Allocate more CPU cores
docker run --cpus="2.0" \
  --name graph-explorer \
  public.ecr.aws/neptune/graph-explorer
```

### Request Optimization

#### Timeout Configuration

```bash
# Increase request timeouts for large queries
--env GRAPH_EXP_FETCH_REQUEST_TIMEOUT=600000  # 10 minutes
```

#### Connection Pooling

The proxy server automatically manages HTTP connections, but you can optimize:

```javascript
// HTTP agent configuration (internal)
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 60000,
});
```

### Logging Performance

#### Log Level Optimization

```bash
# Reduce logging overhead in production
--env LOG_LEVEL=warn

# Use debug only when troubleshooting
--env LOG_LEVEL=debug
```

#### Log Output Optimization

```bash
# Use structured logging for better performance
docker run --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  public.ecr.aws/neptune/graph-explorer
```

## Database Performance

### Query Optimization

#### Gremlin Query Optimization

1. **Use indexes effectively**:

   ```javascript
   // Good: Uses index on 'name' property
   g.V().has("Person", "name", "John");

   // Bad: Full scan
   g.V().hasLabel("Person").has("name", "John");
   ```

2. **Limit result sets**:

   ```javascript
   // Always use limits for exploration
   g.V().hasLabel("Person").limit(100);

   // Use range for pagination
   g.V().hasLabel("Person").range(0, 100);
   ```

3. **Optimize traversals**:

   ```javascript
   // Good: Efficient neighbor traversal
   g.V("person-id").out("knows").limit(50);

   // Bad: Expensive full traversal
   g.V().out("knows").has("age", gt(30));
   ```

#### SPARQL Query Optimization

1. **Use selective patterns**:

   ```sparql
   # Good: Specific pattern first
   SELECT * WHERE {
     ?person rdf:type :Person .
     ?person :name "John" .
     ?person :age ?age .
   } LIMIT 100

   # Bad: Broad pattern first
   SELECT * WHERE {
     ?s ?p ?o .
     ?s rdf:type :Person .
   }
   ```

2. **Use FILTER efficiently**:
   ```sparql
   # Good: Filter early
   SELECT * WHERE {
     ?person rdf:type :Person .
     FILTER(?age > 30)
     ?person :age ?age .
   }
   ```

#### openCypher Query Optimization

1. **Use indexes**:

   ```cypher
   // Good: Index-backed lookup
   MATCH (p:Person {name: 'John'})
   RETURN p LIMIT 100

   // Use EXPLAIN to check query plans
   EXPLAIN MATCH (p:Person {name: 'John'}) RETURN p
   ```

2. **Limit early**:
   ```cypher
   // Good: Limit applied early
   MATCH (p:Person)
   WITH p LIMIT 100
   MATCH (p)-[:KNOWS]->(friend)
   RETURN p, friend
   ```

### Database Configuration

#### Neptune Optimization

1. **Instance sizing**:
   - Use appropriate instance types for your workload
   - Consider memory-optimized instances for large graphs
   - Scale up for better single-query performance

2. **Read replicas**:
   - Use read replicas for read-heavy workloads
   - Connect Graph Explorer to reader endpoints

3. **Query timeout settings**:
   ```bash
   # Neptune query timeout (milliseconds)
   neptune_query_timeout=120000
   ```

#### Gremlin Server Optimization

1. **JVM tuning**:

   ```bash
   # Increase heap size
   -Xmx4g -Xms4g

   # Optimize garbage collection
   -XX:+UseG1GC -XX:MaxGCPauseMillis=200
   ```

2. **Connection pool settings**:
   ```yaml
   # gremlin-server.yaml
   threadPoolWorker: 8
   gremlinPool: 16
   ```

## Network Performance

### Latency Optimization

#### Geographic Proximity

1. **Same region deployment**: Deploy Graph Explorer in the same AWS region as
   Neptune
2. **Availability zone**: Use the same AZ when possible
3. **VPC configuration**: Minimize network hops

#### Connection Optimization

```bash
# Enable HTTP keep-alive (default in Graph Explorer)
# Reduce connection establishment overhead

# Use connection pooling
# Reuse existing connections for multiple requests
```

### Bandwidth Optimization

#### Data Transfer Reduction

1. **Query result limits**: Always use appropriate limits
2. **Property selection**: Select only needed properties
3. **Compression**: Enable gzip compression (automatic in modern browsers)

#### Caching Strategies

1. **Browser caching**: Leverage browser cache for static assets
2. **Query result caching**: Cache frequently accessed data
3. **Schema caching**: Cache database schema information

## Monitoring and Profiling

### Performance Monitoring

#### Browser Performance Tools

1. **Chrome DevTools**:
   - Performance tab for CPU profiling
   - Memory tab for memory usage analysis
   - Network tab for request timing

2. **Performance metrics**:
   ```javascript
   // Monitor key metrics
   console.log(
     "Navigation timing:",
     performance.getEntriesByType("navigation")
   );
   console.log("Resource timing:", performance.getEntriesByType("resource"));
   ```

#### Server Performance Monitoring

1. **Container metrics**:

   ```bash
   # Monitor container resources
   docker stats graph-explorer

   # Check container logs for performance issues
   docker logs graph-explorer | grep -i "slow\|timeout\|error"
   ```

2. **System metrics**:
   ```bash
   # Monitor system resources
   htop
   iotop
   nethogs
   ```

### Database Performance Monitoring

#### Neptune Monitoring

1. **CloudWatch metrics**:
   - CPUUtilization
   - DatabaseConnections
   - GremlinRequestsPerSec
   - GremlinErrors

2. **Query profiling**:
   ```javascript
   // Use profile() step in Gremlin
   g.V().hasLabel("Person").profile();
   ```

#### Query Analysis

1. **Slow query identification**:
   - Monitor query execution times
   - Identify frequently executed queries
   - Analyze query patterns

2. **Index usage analysis**:
   - Check if queries use available indexes
   - Identify missing indexes
   - Monitor index performance

## Performance Best Practices

### Development Best Practices

1. **Query design**:
   - Always include limits in exploratory queries
   - Use specific filters before broad traversals
   - Test queries with representative data sizes

2. **UI design**:
   - Implement progressive disclosure
   - Use pagination for large datasets
   - Provide clear feedback for long-running operations

3. **Error handling**:
   - Implement query cancellation
   - Provide timeout handling
   - Show progress indicators for long operations

### Deployment Best Practices

1. **Resource allocation**:
   - Size containers appropriately for expected load
   - Monitor resource usage and adjust as needed
   - Use auto-scaling for variable workloads

2. **Network configuration**:
   - Minimize network latency
   - Use appropriate security group rules
   - Consider VPC endpoints for AWS services

3. **Monitoring setup**:
   - Implement comprehensive monitoring
   - Set up alerts for performance issues
   - Regular performance reviews and optimization

### Database Best Practices

1. **Schema design**:
   - Design efficient graph schemas
   - Create appropriate indexes
   - Consider query patterns in schema design

2. **Data loading**:
   - Optimize bulk data loading processes
   - Use batch operations when possible
   - Monitor loading performance

3. **Maintenance**:
   - Regular database maintenance
   - Index optimization
   - Query plan analysis

## Troubleshooting Performance Issues

### Common Performance Problems

1. **Slow page loads**:
   - Check network connectivity
   - Verify server resources
   - Analyze browser performance

2. **Query timeouts**:
   - Increase timeout values
   - Optimize query structure
   - Check database performance

3. **Memory issues**:
   - Increase container memory
   - Optimize data loading
   - Clear browser cache

### Performance Debugging

1. **Identify bottlenecks**:

   ```bash
   # Check various components
   # Browser: DevTools Performance tab
   # Network: DevTools Network tab
   # Server: Container resource usage
   # Database: Query execution times
   ```

2. **Systematic analysis**:
   - Start with the slowest component
   - Use profiling tools
   - Test with different data sizes
   - Compare with baseline performance

### Performance Testing

1. **Load testing**:
   - Test with realistic data sizes
   - Simulate concurrent users
   - Monitor resource usage under load

2. **Benchmark testing**:
   - Establish performance baselines
   - Test different configurations
   - Compare optimization results

For additional performance-related troubleshooting, see:

- [Common Issues](./1-common-issues.md)
- [Connection Problems](./2-connection-problems.md)
- [Development Setup](../development/2-development-setup.md)
