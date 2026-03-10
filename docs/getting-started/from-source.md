# Building From Source

Build the Graph Explorer Docker image from the source code.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Git](https://git-scm.com/downloads) installed on your machine

## Steps

1. Clone the repository

   ```
   git clone https://github.com/aws/graph-explorer.git
   ```

2. Build the Docker image

   ```
   cd graph-explorer
   docker build -t graph-explorer .
   ```

3. Run the container

   ```
   docker run -p 80:80 \
     --name graph-explorer \
     --env PROXY_SERVER_HTTPS_CONNECTION=false \
     --env GRAPH_EXP_HTTPS_CONNECTION=false \
     graph-explorer
   ```

4. Open your browser to [http://localhost/explorer](http://localhost/explorer)

## Local Development Without Docker

If you want to run Graph Explorer directly from source for development, see the [Development](../development.md) guide.

## Troubleshooting

If you run into issues, see the [Troubleshooting](../guides/troubleshooting.md) page for common solutions.
