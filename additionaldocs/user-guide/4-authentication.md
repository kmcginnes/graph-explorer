# Authentication

This guide covers authentication methods supported by Graph Explorer, with a
focus on AWS IAM authentication for Amazon Neptune connections.

## Overview

Graph Explorer supports different authentication methods depending on your graph
database setup:

- **No Authentication**: For open databases or development environments
- **AWS IAM Authentication**: For Amazon Neptune with IAM-based security
- **Basic Authentication**: For databases that support HTTP basic auth
- **Custom Headers**: For databases requiring custom authentication headers

## AWS IAM Authentication

Authentication for Amazon Neptune connections is enabled using the
[SigV4 signing protocol](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html).

### Requirements

To use AWS IAM authentication, you must run requests through a proxy endpoint,
such as an EC2 instance, where credentials are resolved and where requests are
signed.

### Setting Up IAM Authentication

To set up a connection in Graph Explorer UI with AWS IAM auth enabled on
Neptune:

1. Check **Using Proxy-Server** in the connection configuration
2. Check **AWS IAM Auth Enabled**
3. Enter the **AWS Region** where the Neptune cluster is hosted (e.g.,
   us-east-1)
4. Set the **Service Type** to either:
   - `neptune-db` for Neptune Database
   - `neptune-graph` for Neptune Analytics

### Credential Resolution

For further information on how AWS credentials are resolved in Graph Explorer,
refer to the
[AWS Credential Provider Chain documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CredentialProviderChain.html).

The credential resolution follows this order:

1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. IAM roles for EC2 instances
3. IAM roles for ECS tasks
4. AWS credentials file
5. Other AWS SDK credential sources

## Permissions and Security

### Graph Explorer Permissions

Graph Explorer does not provide any mechanisms for controlling user permissions.
If you are using Graph Explorer with AWS, Neptune permissions can be controlled
through IAM roles.

### Required Neptune Permissions

For information about what permissions Graph Explorer requires, check out the
documentation on
[SageMaker configuration](../deployment/sagemaker.md#minimum-database-permissions).

<!-- prettier-ignore -->
> [!CAUTION] 
> 
> By default, a Neptune Notebook will have full read & write access to Neptune data.

### Minimum Database Permissions

By default, the permission policy for the IAM role will have full access to the
Neptune Database or Neptune Analytics instance. This means queries executed
within Graph Explorer could contain mutations.

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

#### Neptune DB Minimum Permissions

```json
{
  "Effect": "Allow",
  "Action": [
    "neptune-db:CancelQuery",
    "neptune-db:ReadDataViaQuery",
    "neptune-db:GetGraphSummary"
  ],
  "Resource": [
    "arn:[AWS_PARTITION]:neptune-db:[AWS_REGION]:[AWS_ACCOUNT_ID]:[NEPTUNE_CLUSTER_RESOURCE_ID]/*"
  ]
}
```

#### Neptune Analytics Minimum Permissions

```json
{
  "Effect": "Allow",
  "Action": [
    "neptune-graph:CancelQuery",
    "neptune-graph:GetGraphSummary",
    "neptune-graph:ReadDataViaQuery"
  ],
  "Resource": [
    "arn:[AWS_PARTITION]:neptune-graph:[AWS_REGION]:[AWS_ACCOUNT_ID]:graph/[NEPTUNE_GRAPH_RESOURCE_ID]"
  ]
}
```

## Security Best Practices

### HTTPS Connections

Graph Explorer supports the HTTPS protocol by default and provides a self-signed
certificate as part of the Docker image. You can choose to use HTTP instead by
changing the environment variable default settings.

### Connection Security

You can use Graph Explorer to connect to:

- A publicly accessible graph database endpoint
- A proxy endpoint that redirects to a private graph database endpoint

For production deployments, it's recommended to:

1. Use HTTPS connections
2. Implement proper network security (VPC, security groups)
3. Use IAM authentication where supported
4. Follow the principle of least privilege for permissions

### Certificate Management

If either Graph Explorer or the proxy-server are served over an HTTPS connection
(which it is by default), you will have to bypass the warning message from the
browser due to the included certificate being a self-signed certificate.

You can:

- Bypass by manually ignoring them from the browser
- Download the correct certificate and configure them to be trusted
- Provide your own certificate

For detailed instructions on managing certificates, see the
[HTTPS Connections](../troubleshooting/common-issues.md#https-connections)
troubleshooting guide.

## Troubleshooting Authentication

### Common Authentication Issues

1. **Credential Resolution Failures**: Ensure AWS credentials are properly
   configured
2. **Permission Denied**: Verify IAM policies include required Neptune
   permissions
3. **Region Mismatch**: Ensure the AWS region matches your Neptune cluster
   location
4. **Service Type Mismatch**: Verify correct service type (neptune-db vs
   neptune-graph)

### Debugging Authentication

To debug authentication issues:

1. Check the browser developer tools for network errors
2. Review the proxy server logs for authentication failures
3. Verify AWS credentials are accessible from the proxy server environment
4. Test connectivity to Neptune endpoints directly

For more detailed troubleshooting, see the
[Connection Problems](../troubleshooting/2-connection-problems.md) guide.
