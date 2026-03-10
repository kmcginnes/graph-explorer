# Getting Started

The quickest way to try Graph Explorer is with Docker Compose. This will start Graph Explorer and a Gremlin Server database pre-loaded with the [air routes](https://github.com/krlawrence/graph/blob/main/sample-data/air-routes-latest.graphml) sample dataset so you can start exploring immediately.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine

## Quick Start

1. Clone the repository

   ```
   git clone https://github.com/aws/graph-explorer.git
   ```

2. Start Graph Explorer and the sample database

   ```
   cd graph-explorer/samples/air_routes
   docker compose up
   ```

3. Open your browser to [http://localhost:8080/explorer](http://localhost:8080/explorer)

That's it. Graph Explorer is connected to the sample database and ready to use.

## Your First Exploration

Once Graph Explorer loads, you'll land on the connections screen with the sample database already connected.

### Search for a Node

1. Click "Graph" in the navigation bar to open the graph view
2. In the sidebar on the right, use the search panel to find a node
3. Select "airport" as the node type
4. Type "SEA" in the attribute filter to find Seattle-Tacoma International Airport
5. Click the "+" button on the search result to add it to the graph

### Expand Neighbors

1. Double-click the airport node on the canvas to expand its direct connections
2. You'll see connected airports, countries, and continents appear
3. Use the expand panel in the sidebar to filter expansions by node type or limit the number of results

### Use the Table View

1. The table view at the bottom of the graph view shows all nodes and edges currently on the canvas
2. Use the dropdown to switch between viewing nodes and edges
3. Click "Download" to export the current data as CSV or JSON

### Explore the Schema

1. Click "Schema" in the navigation bar
2. This shows the data model of the connected database — node types and how they relate to each other
3. Click on a node type to see its properties and data types

### Browse Data

1. Click "Data Table" in the navigation bar
2. Select a node type from the dropdown to browse all nodes of that type
3. Click "Send to Explorer" on any row to add that node to the graph view

## Next Steps

Now that you have Graph Explorer running, here are some paths to explore:

- [Features Overview](../features/README.md) — detailed guide to all features and functionality
- [Connecting to Neptune](../guides/connecting-to-neptune.md) — connect to an Amazon Neptune database
- [Connecting to Gremlin Server](../guides/connecting-to-gremlin-server.md) — connect to your own Gremlin Server instance
- [Connecting to Blazegraph](../guides/connecting-to-blazegraph.md) — connect to a Blazegraph RDF database
- [Deploy to ECS Fargate](../guides/deploy-to-ecs-fargate.md) — deploy Graph Explorer to AWS ECS
- [Deploy to SageMaker](../guides/deploy-to-sagemaker.md) — deploy Graph Explorer as a SageMaker notebook

## Other Setup Options

- [Docker](./docker.md) — run Graph Explorer using the official Docker image
- [Amazon EC2](./ec2.md) — deploy Graph Explorer on EC2 with Neptune
- [From Source](./from-source.md) — build the Docker image from source code

## Troubleshooting

If you run into issues, see the [Troubleshooting](../guides/troubleshooting.md) page for common solutions.
