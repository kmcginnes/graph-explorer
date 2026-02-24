# Dev Air Routes Sample

| Database         | Query Language | Data Source  |
| ---------------- | -------------- | ------------ |
| [Gremlin Server] | [Gremlin]      | [Air Routes] |

[Air Routes]:
  https://github.com/krlawrence/graph/blob/main/sample-data/air-routes-latest.graphml
[Gremlin]: https://tinkerpop.apache.org/gremlin.html
[Gremlin Server]:
  https://tinkerpop.apache.org/docs/current/reference/#gremlin-server

This sample runs Graph Explorer in development mode with hot reloading, using
Gremlin Server pre-loaded with the air routes sample data. Source code changes
in `packages/graph-explorer/src`, `packages/graph-explorer-proxy-server/src`,
and `packages/shared/src` are reflected immediately without rebuilding the
container.

> [!NOTE]
> The data is not persisted between restarts of the Docker container.

> [!NOTE]
> The first build will take a few minutes to install dependencies. Subsequent
> starts will be faster if the image is cached.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine

## Running Sample

1. Clone or download this repository
2. Navigate to the `samples/dev_air_routes` directory
   ```
   cd samples/dev_air_routes
   ```
3. Run the following command to build and start the containers
   ```
   docker compose up --build
   ```
4. Open the browser and navigate to:
   [http://localhost:5173/explorer](http://localhost:5173/explorer)

## Ports

- `5173` - Vite dev server (frontend with hot reloading)
- `8080` - Proxy server (backend API)
