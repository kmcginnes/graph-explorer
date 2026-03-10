# Amazon EC2 Setup

Deploy Graph Explorer on an Amazon EC2 instance and connect to Amazon Neptune using SSH tunneling.

> [!NOTE]
>
> This is not an official recommendation on network setups. There are many ways to connect to Amazon Neptune from outside the VPC, such as setting up a load balancer or VPC peering.

## Prerequisites

- An Amazon EC2 instance that can access your Neptune cluster. For provisioning details, see the [graph-notebook instructions](https://github.com/aws/graph-notebook/tree/main/additional-databases/neptune).
- The EC2 instance security group allows inbound traffic on ports `22` (SSH), `8182` (Neptune), and `443` or `80` (Graph Explorer).
- [Git](https://git-scm.com/downloads) and [Docker](https://docs.docker.com/get-docker/) installed on the EC2 instance.

## Steps

1. SSH into your EC2 instance

2. Clone the repository

   ```
   git clone https://github.com/aws/graph-explorer.git
   ```

3. Build the Docker image

   ```
   cd graph-explorer
   docker build -t graph-explorer .
   ```

   > [!TIP]
   >
   > If you receive an error about the Docker service not running, run `service docker start`.

4. Run the container, replacing `{hostname-or-ip-address}` with the public hostname or IP of your EC2 instance

   ```
   docker run -p 80:80 -p 443:443 \
     --env HOST={hostname-or-ip-address} \
     graph-explorer
   ```

5. Open your browser and navigate to the public URL of your EC2 instance

   ```
   https://ec2-1-2-3-4.us-east-1.compute.amazonaws.com/explorer
   ```

6. Trust the self-signed certificate in your browser. See [HTTPS Connections](../references/https-connections.md) for instructions.

7. After trusting the certificate and refreshing, you'll see the connections screen.

## Connecting to Neptune

Add a new connection with the following settings:

- **Name** — a label for your connection (e.g., `My Neptune Cluster`)
- **Query Language** — the query language your Neptune cluster uses
- **Public or Proxy Endpoint** — `https://{ec2-public-hostname}`
- **Using Proxy Server** — checked
- **Graph Connection URL** — `https://{neptune-endpoint}:8182`

If your Neptune cluster has IAM authentication enabled:

- **AWS IAM Auth Enabled** — checked
- **AWS Region** — the region of your Neptune cluster (e.g., `us-east-1`)
- **Service Type** — `neptune-db` for Neptune Database or `neptune-graph` for Neptune Analytics

For more details, see [Connecting to Neptune](../guides/connecting-to-neptune.md).

## Troubleshooting

If you run into issues, see the [Troubleshooting](../guides/troubleshooting.md) page for common solutions.
