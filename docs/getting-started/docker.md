# Docker Setup

Run Graph Explorer using the official Docker image from [Amazon ECR Public](https://gallery.ecr.aws/neptune/graph-explorer).

> [!NOTE]
>
> Make sure to use the version of the image that does not include `sagemaker` in the tag.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine

## Steps

1. Pull the Docker image

   ```
   docker pull public.ecr.aws/neptune/graph-explorer
   ```

2. Run the container

   ```
   docker run -p 80:80 \
     --name graph-explorer \
     --env PROXY_SERVER_HTTPS_CONNECTION=false \
     --env GRAPH_EXP_HTTPS_CONNECTION=false \
     public.ecr.aws/neptune/graph-explorer
   ```

3. Open your browser to [http://localhost/explorer](http://localhost/explorer)

4. You'll see the connections screen where you can configure your first database connection

> [!TIP]
>
> If you need to pull from ECR Public with authentication (e.g., to avoid rate limits), you can authenticate with:
>
> ```
> aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
> ```

## Connecting to a Database

Once Graph Explorer is running, you need to add a connection to your graph database. Click "+" on the connections screen and provide:

- **Name** — a label for your connection
- **Query Language** — Gremlin, openCypher, or SPARQL
- **Public or Proxy Endpoint** — `http://localhost`
- **Using Proxy Server** — check this box
- **Graph Connection URL** — the URL of your graph database

### Example: Gremlin Server

If you have a Gremlin Server running locally on port 8182:

- **Query Language:** Gremlin
- **Public or Proxy Endpoint:** `http://localhost`
- **Using Proxy Server:** checked
- **Graph Connection URL:** `http://host.docker.internal:8182`

> [!NOTE]
>
> Use `http://host.docker.internal` instead of `http://localhost` for the graph connection URL when the database is running on your host machine outside of Docker.

## Using HTTPS

The steps above disable HTTPS for simplicity. To enable HTTPS with the included self-signed certificate:

```
docker run -p 80:80 -p 443:443 \
  --env HOST=localhost \
  --name graph-explorer \
  public.ecr.aws/neptune/graph-explorer
```

You will need to trust the self-signed certificate in your browser. See [HTTPS Connections](../references/https-connections.md) for instructions.

## Configuring a Default Connection

You can pre-configure a database connection using environment variables so Graph Explorer connects automatically on startup. See [Default Connection](../references/default-connection.md) for details.

## Changing Ports

If ports 80 or 443 are already in use, change the host ports with the `-p` flag:

```
docker run -p 8080:80 \
  --name graph-explorer \
  --env PROXY_SERVER_HTTPS_CONNECTION=false \
  --env GRAPH_EXP_HTTPS_CONNECTION=false \
  public.ecr.aws/neptune/graph-explorer
```

Then access Graph Explorer at [http://localhost:8080/explorer](http://localhost:8080/explorer).

## Troubleshooting

If you run into issues, see the [Troubleshooting](../guides/troubleshooting.md) page for common solutions.
