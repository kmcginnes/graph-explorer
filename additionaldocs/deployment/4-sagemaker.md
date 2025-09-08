# SageMaker Deployment

This guide covers deploying Graph Explorer on Amazon SageMaker Notebooks using
lifecycle configurations.

## Overview

Graph Explorer can be hosted and launched on Amazon SageMaker Notebooks via a
lifecycle configuration script. To learn more about lifecycle configurations and
how to create one, see the
[documentation](https://docs.aws.amazon.com/sagemaker/latest/dg/notebook-lifecycle-config.html).

## Prerequisites

- Amazon SageMaker notebook instance
- IAM role with appropriate permissions
- Access to Amazon Neptune (if using Neptune)

## Setup Instructions

### Step 1: Create IAM Role and Policies

You should create an IAM role with a policy containing the permissions described
in either the Neptune DB or Neptune Analytics policy files, depending on the
service used.

#### For Neptune Database

Use the permissions from the Neptune DB policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "neptune-db:CancelQuery",
        "neptune-db:ReadDataViaQuery",
        "neptune-db:GetGraphSummary"
      ],
      "Resource": ["arn:aws:neptune-db:*:*:cluster/*"]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

#### For Neptune Analytics

Use the permissions from the Neptune Analytics policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "neptune-graph:CancelQuery",
        "neptune-graph:GetGraphSummary",
        "neptune-graph:ReadDataViaQuery"
      ],
      "Resource": ["arn:aws:neptune-graph:*:*:graph/*"]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### Step 2: Create Lifecycle Configuration

You can use the provided sample lifecycle configuration script or create your
own shell script.

#### Sample Lifecycle Configuration Script

```bash
#!/bin/bash

set -e

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    yum update -y
    yum install -y docker
    service docker start
    usermod -a -G docker ec2-user
fi

# Start Docker service
service docker start

# Pull Graph Explorer image
echo "Pulling Graph Explorer image..."
docker pull public.ecr.aws/neptune/graph-explorer:latest

# Stop and remove existing container if it exists
docker stop graph-explorer 2>/dev/null || true
docker rm graph-explorer 2>/dev/null || true

# Run Graph Explorer container
echo "Starting Graph Explorer container..."
docker run -d \
    --name graph-explorer \
    -p 9250:80 \
    --restart unless-stopped \
    --env PROXY_SERVER_HTTPS_CONNECTION=false \
    --env GRAPH_EXP_HTTPS_CONNECTION=false \
    public.ecr.aws/neptune/graph-explorer:latest

echo "Graph Explorer started successfully on port 9250"
```

### Step 3: Attach Configuration to Notebook

After you have created the lifecycle configuration and IAM role, you can attach
them to a new or existing SageMaker notebook instance:

1. Navigate to the SageMaker console
2. Go to **Notebook instances**
3. Create a new notebook or modify an existing one
4. Under **Notebook instance settings** → **Additional configuration** →
   **Lifecycle configuration**, select your lifecycle configuration
5. Under **Permission and encryption** → **IAM role**, select your IAM role

### Step 4: Access Graph Explorer

When the notebook has been started and is in "Ready" state, you can access Graph
Explorer by adding the `/proxy/9250/explorer/` extension to the base notebook
URL. The Graph Explorer link should look something like:

```
https://graph-explorer-notebook-name.notebook.us-west-2.sagemaker.aws/proxy/9250/explorer/
```

## Configuration Options

### Custom Port Configuration

If you need to use a different port, modify the lifecycle script:

```bash
# Use port 8080 instead of 9250
docker run -d \
    --name graph-explorer \
    -p 8080:80 \
    --restart unless-stopped \
    public.ecr.aws/neptune/graph-explorer:latest
```

Then access via `/proxy/8080/explorer/`

### Environment Variables

Add environment variables to configure default connections:

```bash
docker run -d \
    --name graph-explorer \
    -p 9250:80 \
    --restart unless-stopped \
    --env PROXY_SERVER_HTTPS_CONNECTION=false \
    --env GRAPH_EXP_HTTPS_CONNECTION=false \
    --env PUBLIC_OR_PROXY_ENDPOINT=https://notebook-name.notebook.region.sagemaker.aws/proxy/9250 \
    --env GRAPH_TYPE=gremlin \
    --env USING_PROXY_SERVER=true \
    --env IAM=true \
    --env GRAPH_CONNECTION_URL=https://your-neptune-cluster.region.neptune.amazonaws.com:8182 \
    --env AWS_REGION=us-west-2 \
    --env SERVICE_TYPE=neptune-db \
    public.ecr.aws/neptune/graph-explorer:latest
```

### Persistent Storage

To persist Graph Explorer configuration across notebook restarts:

```bash
# Create persistent directory
mkdir -p /home/ec2-user/SageMaker/graph-explorer-data

# Run with volume mount
docker run -d \
    --name graph-explorer \
    -p 9250:80 \
    -v /home/ec2-user/SageMaker/graph-explorer-data:/graph-explorer/data \
    --restart unless-stopped \
    public.ecr.aws/neptune/graph-explorer:latest
```

## Security Considerations

### Minimum Database Permissions

By default, the permission policy for the IAM role of the SageMaker instance
will have full access to the Neptune Database or Neptune Analytics instance.
This means queries executed within Graph Explorer could contain mutations.

To restrict Graph Explorer access for its most basic functionality you can use
these minimum permissions:

- Read data via queries
- Get the graph summary information (used for schema sync)
- Cancel query

<!-- prettier-ignore -->
> [!CAUTION] 
> 
> If you are using the standard notebook setup, these policies will apply to both the Jupyter graph notebooks as well as Graph Explorer.

If a user attempts to execute a mutation query inside of Graph Explorer, they
will be presented with an error that informs them they are not authorized for
that request.

### Network Security

SageMaker notebooks run in a managed environment, but consider these security
practices:

1. **VPC Configuration**: Place notebooks in private subnets when possible
2. **Security Groups**: Configure appropriate security group rules
3. **IAM Policies**: Use least-privilege IAM policies
4. **Network ACLs**: Implement network-level access controls

## Monitoring and Logging

### CloudWatch Integration

The Graph Explorer proxy server outputs log statements to standard out. By
default, these logs will be forwarded to CloudWatch if the Notebook has the
proper permissions.

### Gathering Logs

To gather these logs:

1. Open the AWS Console
2. Navigate to the Neptune page
3. Select "Notebook" from the sidebar
4. Find the Notebook hosting Graph Explorer
5. Open the details screen for that Notebook
6. In the "Actions" menu, choose "View Details in SageMaker"
7. Press the "View Logs" link in the SageMaker details screen under the field
   titled "Lifecycle configuration"
8. Scroll down to the "Log Streams" panel in the CloudWatch details where you
   should find multiple log streams
9. For each log stream related to Graph Explorer (LifecycleConfigOnStart.log,
   graph-explorer.log)
   1. Open the log stream
   2. In the "Actions" menu, choose "Download search results (CSV)"

### Missing Log Streams

New Neptune Notebooks automatically apply the correct IAM permissions to write
to CloudWatch. If your Notebook does not automatically create a
graph-explorer.log in the CloudWatch Log Streams, then it is possible that the
Neptune Notebook was created before those IAM permissions were added. You'll
need to add those permissions manually.

## Troubleshooting

### Common Issues

1. **Container Not Starting**: Check Docker service status and logs
2. **Port Conflicts**: Ensure port 9250 (or your chosen port) is available
3. **Permission Issues**: Verify IAM role has necessary permissions
4. **Network Connectivity**: Check VPC and security group configurations

### Debugging Commands

Access the SageMaker notebook terminal and run:

```bash
# Check Docker status
sudo service docker status

# View container logs
docker logs graph-explorer

# Check container status
docker ps -a

# Restart container
docker restart graph-explorer
```

### Log Analysis

Check the lifecycle configuration logs in CloudWatch:

1. Navigate to CloudWatch Logs
2. Find the log group for your notebook
3. Look for LifecycleConfigOnStart.log
4. Review any error messages during Graph Explorer installation

## Best Practices

### Resource Management

1. **Instance Size**: Choose appropriate instance sizes for your workload
2. **Auto-Stop**: Configure auto-stop to manage costs
3. **Storage**: Monitor EBS storage usage
4. **Memory**: Ensure adequate memory for graph operations

### Development Workflow

1. **Version Control**: Store lifecycle configurations in version control
2. **Testing**: Test configurations in development notebooks first
3. **Documentation**: Document custom configurations and modifications
4. **Backup**: Backup important notebook data and configurations

### Performance Optimization

1. **Container Resources**: Allocate appropriate CPU and memory to containers
2. **Network**: Ensure good network connectivity to Neptune
3. **Caching**: Leverage Graph Explorer's caching capabilities
4. **Query Optimization**: Use efficient graph queries

For additional troubleshooting, see the
[Common Issues](../troubleshooting/1-common-issues.md) guide.
