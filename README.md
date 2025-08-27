# Graph Explorer

Graph Explorer is a React-based web application that lets you visualize and
explore graph data without writing queries. Whether you're working with property
graphs or RDF data, Graph Explorer provides an intuitive interface to discover
connections in your data.

![A sample image of property graph created by Graph Explorer](./images/LPGIMDb.png)
![A sample image of RDF graph created by Graph Explorer](./images/RDFEPL.png)

## Quick Start - Try It Now!

The fastest way to experience Graph Explorer is with our pre-configured sample
that includes both the application and a sample database:

### Air Routes Sample (5 minutes)

This sample runs Graph Explorer with a Gremlin Server database pre-loaded with
air routes data, so you can start exploring immediately.

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) installed on
your machine

**Steps:**

1. Clone or download this repository
2. Navigate to the samples directory:
   ```bash
   cd samples/air_routes
   ```
3. Start the sample:
   ```bash
   docker compose up
   ```
4. Open your browser and go to:
   [http://localhost:8080/explorer](http://localhost:8080/explorer)

That's it! You now have Graph Explorer running with sample data ready to
explore. Try searching for airports, expanding connections, or exploring the
graph visualization features.

> **Note:** The sample data is not persisted between container restarts, so it's
> perfect for experimentation.

## Other Getting Started Options

### Connect to Your Own Database

If you have an existing graph database, you can connect Graph Explorer to it:

#### Using the Official Docker Image

The quickest way to run Graph Explorer with your own database:

1. **Pull the official image:**

   ```bash
   # Authenticate with Amazon ECR Public Registry
   aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws

   # Pull the image
   docker pull public.ecr.aws/neptune/graph-explorer
   ```

2. **Run Graph Explorer:**

   ```bash
   docker run -p 80:80 -p 443:443 \
     --env HOST=localhost \
     --name graph-explorer \
     public.ecr.aws/neptune/graph-explorer
   ```

3. **Open Graph Explorer:** Navigate to `https://localhost/explorer` and
   configure your database connection through the UI.

#### Supported Databases

Graph Explorer works with databases that support these query languages:

- **Gremlin**: Amazon Neptune, Apache TinkerPop Gremlin Server, JanusGraph
- **openCypher**: Amazon Neptune
- **SPARQL**: Amazon Neptune, Blazegraph, and other SPARQL 1.1 endpoints

### More Setup Options

For additional setup scenarios, see our
[detailed getting started guide](./additionaldocs/getting-started/README.md):

- [Amazon EC2 Setup](./additionaldocs/getting-started/README.md#amazon-ec2-setup) -
  Deploy on EC2 to connect to Amazon Neptune
- [Local Development Setup](./additionaldocs/getting-started/README.md#local-development-setup) -
  Build from source code
- [Troubleshooting](./additionaldocs/troubleshooting.md) - Common issues and
  solutions

## What You Can Do with Graph Explorer

Graph Explorer provides a comprehensive set of tools for working with graph
data:

- **🔍 Visual Graph Exploration** - Interactive graph visualization with search,
  filtering, and expansion capabilities
- **📊 Multiple View Modes** - Switch between graph visualization and tabular
  data views
- **🔌 Database Connections** - Easy setup for Amazon Neptune, Gremlin Server,
  and SPARQL endpoints
- **🎨 Customizable Styling** - Personalize node colors, icons, and display
  properties
- **📤 Data Export** - Export your discoveries to CSV or JSON formats
- **🔍 Advanced Search** - Filter by node types, attributes, or run custom
  queries

For complete documentation on all features, see our
[detailed features guide](./additionaldocs/features/README.md).

## Database Compatibility

Graph Explorer supports multiple graph database types and query languages:

| Query Language | Databases                                                   |
| -------------- | ----------------------------------------------------------- |
| **Gremlin**    | Amazon Neptune, Apache TinkerPop Gremlin Server, JanusGraph |
| **openCypher** | Amazon Neptune                                              |
| **SPARQL 1.1** | Amazon Neptune, Blazegraph, other SPARQL endpoints          |

### Minimum Recommended Versions

- **Amazon Neptune**: Version 1.2.1.0 or above (includes summary API and
  TinkerPop 3.6.2)
- **Non-Neptune databases**: TinkerPop 3.6 or above

If you're interested in our future development plans, check out our
[roadmap](./ROADMAP.md) and participate in the discussions.

## Advanced Configuration

For advanced setup scenarios including default connections, environment
variables, and detailed configuration options, see:

- [Connections Guide](./additionaldocs/connections.md) - Detailed connection
  setup for different databases
- [Development Guide](./additionaldocs/development.md) - Environment variables
  and development setup

## Security & Authentication

Graph Explorer uses HTTPS by default with a self-signed certificate. For
production deployments:

- **HTTPS**: Enabled by default with self-signed certificates (you'll need to
  accept browser warnings)
- **AWS IAM Authentication**: Supported for Amazon Neptune using SigV4 signing
- **Proxy Server**: Can be used to connect to private database endpoints

For detailed security configuration, certificate management, and authentication
setup, see:

- [Development Guide](./additionaldocs/development.md#environment-variables) -
  HTTPS configuration
- [Troubleshooting](./additionaldocs/troubleshooting.md#https-connections) -
  Certificate setup
- [SageMaker Guide](./additionaldocs/sagemaker/README.md#minimum-database-permissions) -
  Required permissions

## Monitoring & Operations

- **Health Check**: The proxy server provides a `/status` endpoint for health
  monitoring
- **Logging**: Configurable log levels (error, warn, info, debug, trace) via
  `LOG_LEVEL` environment variable
- **Docker Logs**: Access logs with `docker logs {container-name}`

For detailed operational guidance, see the
[Development Guide](./additionaldocs/development.md).

## Contributing Guidelines

See [CONTRIBUTING](./CONTRIBUTING.md) for more information.

## License

This project is licensed under the Apache-2.0 License.
