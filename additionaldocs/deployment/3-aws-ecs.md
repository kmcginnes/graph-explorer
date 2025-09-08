# AWS ECS Deployment

This guide covers deploying Graph Explorer on AWS Fargate using Amazon ECS,
including setup for connecting to Amazon Neptune.

## Overview

The following steps will allow you to set up Graph Explorer on AWS Fargate in
Amazon ECS, and connect to a running Neptune database.

## Prerequisites

- AWS account with appropriate permissions
- Amazon Neptune cluster (optional, for Neptune connections)
- Domain name for SSL certificate (recommended for production)

## Step 1: Create IAM Role and Permissions

### Create ECS Task Role

1. Open the IAM console at https://console.aws.amazon.com/iam/.
2. In the navigation pane, click **Roles**, and then click **Create role**.
3. Choose **AWS service** as the role type. Under **Use cases for other AWS
   services**, choose **Elastic Container Service** in the dropdown, then select
   the **Elastic Container Service Task** option.
4. Click **Next**.
5. Under **Permissions policies**, search for and select the AWS managed
   policies:
   - [AmazonECSTaskExecutionRolePolicy](https://console.aws.amazon.com/iam/home#/policies/arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy)
   - [CloudWatchLogsFullAccess](https://console.aws.amazon.com/iam/home#/policies/arn:aws:iam::aws:policy/CloudWatchLogsFullAccess)
6. Click **Next**.
7. For **Role name**, set the value to `GraphExplorer_ECS_Role`. Optionally, you
   can enter a description.
8. For **Add tags (optional)**, enter any custom tags to associate with the
   policy.
9. Click **Create role** to finish.

### Add Neptune Permissions (if using Neptune)

If connecting to Neptune, add these permissions to your role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "neptune-db:ReadDataViaQuery",
        "neptune-db:GetGraphSummary",
        "neptune-db:CancelQuery"
      ],
      "Resource": "arn:aws:neptune-db:*:*:cluster/*"
    }
  ]
}
```

## Step 2: Request ACM Public Certificate

### Create SSL Certificate

1. Open the ACM console at https://console.aws.amazon.com/acm/home.
2. In the left hand navigation pane, click **Request certificate**.
3. Under **Certificate type**, choose **Request a public certificate**.
4. Click **Next**.
5. In the **Domain names** section, enter your desired domain name.
   - You can use a fully qualified domain name (FQDN), such as
     `graphexplorer.example.com`, or a bare or apex domain name such as
     `example.com`. You can also use an asterisk (\*) as a wild card in the
     leftmost position to protect several site names in the same domain.
6. In the **Validation method** section, choose either **DNS validation –
   `recommended`** or **Email validation**, depending on your needs.
7. In the **Key algorithm** section, choose one of the available algorithms:
   - RSA 2048 (default)
   - ECDSA P 256
   - ECDSA P 384
8. (Optional) Under the **Tags** section, you can add tags for your certificate.
9. Click **Request**.

After the request is processed, complete the validation process according to
your chosen method.

## Step 3: Create ECS Cluster

### Set Up Cluster

1. Open the ECS console at https://console.aws.amazon.com/ecs/v2.
2. In the left hand navigation pane, click **Clusters**.
3. On the Clusters page, click **Create cluster**.
4. Under **Cluster configuration**, for **Cluster name**, enter a unique
   identifier.
5. Under **Infrastructure**, select only **AWS Fargate**.
6. (Optional) To turn on Container Insights, expand **Monitoring**, and then
   turn on **Use Container Insights**.
7. (Optional) To help identify your cluster, expand **Tags**, and then configure
   your tags.
8. Click **Create**.

## Step 4: Create ECS Task Definition

### Task Definition Configuration

1. Open the ECS console at https://console.aws.amazon.com/ecs/v2.
2. In the left hand navigation pane, choose **Task definitions**.
3. Click **Create new task definition** → **Create new task definition with
   JSON**.
4. In the JSON editor box, copy in the following template:

```json
{
  "family": "graph-explorer",
  "containerDefinitions": [
    {
      "name": "graph-explorer",
      "image": "public.ecr.aws/neptune/graph-explorer:latest",
      "cpu": 0,
      "portMappings": [
        {
          "name": "graph-explorer-80-tcp",
          "containerPort": 80,
          "hostPort": 80,
          "protocol": "tcp",
          "appProtocol": "http"
        },
        {
          "name": "graph-explorer-443-tcp",
          "containerPort": 443,
          "hostPort": 443,
          "protocol": "tcp",
          "appProtocol": "http"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "AWS_REGION",
          "value": "us-west-2"
        },
        {
          "name": "GRAPH_TYPE",
          "value": "gremlin"
        },
        {
          "name": "GRAPH_EXP_HTTPS_CONNECTION",
          "value": "true"
        },
        {
          "name": "IAM",
          "value": "false"
        },
        {
          "name": "USING_PROXY_SERVER",
          "value": "true"
        },
        {
          "name": "PUBLIC_OR_PROXY_ENDPOINT",
          "value": "https://{FQDN_from_step2}"
        },
        {
          "name": "HOST",
          "value": "localhost"
        },
        {
          "name": "SERVICE_TYPE",
          "value": "neptune-db"
        },
        {
          "name": "GRAPH_CONNECTION_URL",
          "value": "https://{NEPTUNE_ENDPOINT}:8182"
        },
        {
          "name": "PROXY_SERVER_HTTPS_CONNECTION",
          "value": "true"
        }
      ],
      "mountPoints": [],
      "volumesFrom": [],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-create-group": "true",
          "awslogs-group": "/ecs/graph-explorer",
          "awslogs-region": "{REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "taskRoleArn": "arn:aws:iam::{account_no}:role/GraphExplorer_ECS_Role",
  "executionRoleArn": "arn:aws:iam::{account_no}:role/GraphExplorer_ECS_Role",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "3072",
  "runtimePlatform": {
    "cpuArchitecture": "X86_64",
    "operatingSystemFamily": "LINUX"
  }
}
```

### Update Configuration Values

In the JSON template, update the following fields:

- `taskRoleArn` and `executionRoleArn`: The ARN of the IAM role created in step
  1
- `environment` variables section:
  - `AWS_REGION`: The AWS region in which your Neptune cluster is located
  - `GRAPH_TYPE`: The query language for your initial connection
  - `IAM`: Set this to `true` to use SigV4 signed requests, if your Neptune
    cluster has IAM db authentication enabled
  - `GRAPH_CONNECTION_URL`: Set this as `https://{NEPTUNE_ENDPOINT}:8182`
  - `PUBLIC_OR_PROXY_ENDPOINT`: Set this as your domain from step 2
  - `SERVICE_TYPE`: Set this as `neptune-db` for Neptune database or
    `neptune-graph` for Neptune Analytics

Click **Create** to save the task definition.

## Step 5: Create Fargate Service

### Service Configuration

1. Open the ECS console at https://console.aws.amazon.com/ecs/v2.
2. In the left hand navigation pane, choose **Clusters**.
3. On the Clusters page, select the cluster created in step 3.
4. Under the **Services** tab, click **Create**.
5. Under the **Environment** section, expand **Compute configuration** and
   configure the options:
   - **Compute options**: `Launch type`
   - **Launch type**: `FARGATE`
   - **Platform Version**: `LATEST`

### Deployment Configuration

6. Under the **Deployment configuration** section, set the following:
   - **Application type**: Choose **Task**
   - **Task definition**: Choose the task definition created in step 4, and
     select the latest revision
   - **Service name**: Enter a name for your service, ex.
     `svc-graphexplorer-demo`
   - **Service type**: Choose **Replica**
   - **Desired tasks**: Enter the number of tasks to launch and maintain in the
     service

### Networking Configuration

7. Expand the **Networking** section, and set the following:
   - **VPC**: Select the VPC where your Neptune database is located
   - **Subnets**: Select all of the public subnets for that VPC, and remove any
     unassociated subnets
   - **Security group**: Select **Create a new security group**, and set the
     fields as:
     - **Security group name**: `graphexplorer-demo`
     - **Security group description**:
       `Security group for access to graph-explorer`
     - **Inbound rules**: Add two rules, one with type `HTTPS` and port range
       `443`, and the second with type `HTTP` and port range `80`. Preferably,
       authorize only a specific IP address range to access your instances.

### Load Balancer Configuration

8. Expand the **Load balancing** section.
9. Select **Application load balancer**, and create a new load balancer with the
   configuration:
   - **Load balancer name**: `lb-graph-explorer-demo`
   - **Choose container to load balance**: `graph-explorer 443:443`
   - **Listener**: Select **Create New listener**, then set **Port** as `443`
     and **Protocol** as `HTTPS`
   - **Certificate**: Select **Choose from ACM certificates**, then select the
     domain name created in step 2
   - **Target group**: Select **Create new target group**, with the options set
     to:
     - **Target group name**: `tg-graphexplorer-demo` with **Protocol** as
       `HTTPS`
     - **Health check path**: `/explorer/` with **Health check protocol** as
       `HTTPS`

### Additional Configuration

10. (Optional) Under section **Service auto scaling**, specify the desired
    scaling configuration.
11. (Optional) To help identify your service and tasks, expand the **Tags**
    section, then configure your desired tags.
12. Click **Create**.

## Step 6: Create Route53 Entry

### DNS Configuration

1. Open the Route 53 console at https://console.aws.amazon.com/route53/.
2. In the left hand navigation pane, click **Hosted zones**.
3. Under **Hosted zones**, click the name of the hosted zone that you want to
   create records in.
4. Under the **Records** tab, click **Create record**.
5. Under the record displayed in the **Quick create record** section, set the
   following configuration:
   - **Record name**: Enter the subdomain name that you want to use to route
     traffic to your Application load balancer
   - **Alias**: Enable this option, and configure:
     - **Choose endpoint**: Select
       `Alias to Application and Classic Load Balancer`
     - **Choose region**: Select the AWS region that the endpoint is from
     - **Choose load balancer**: Choose the name that you assigned to the load
       balancer when you created the ECS Fargate Service
6. Leave everything else default, and click **Create records**.

## Step 7: Access Graph Explorer

After DNS propagation (usually within 60 seconds), you can access Graph Explorer
using your domain:

```
https://graphexplorer.example.com/explorer
```

## Advanced Configuration

### Auto Scaling

Configure auto scaling for high availability:

```json
{
  "serviceName": "graph-explorer-service",
  "scalingPolicies": [
    {
      "policyName": "cpu-scaling",
      "targetTrackingScalingPolicies": [
        {
          "targetValue": 70.0,
          "scaleOutCooldown": 300,
          "scaleInCooldown": 300,
          "predefinedMetricSpecification": {
            "predefinedMetricType": "ECSServiceAverageCPUUtilization"
          }
        }
      ]
    }
  ]
}
```

### Multiple Environments

Use different task definitions for different environments:

- `graph-explorer-dev`: Development environment
- `graph-explorer-staging`: Staging environment
- `graph-explorer-prod`: Production environment

### Blue/Green Deployments

Configure blue/green deployments for zero-downtime updates:

1. Create a new task definition revision
2. Update the service to use the new revision
3. Monitor the deployment progress
4. Rollback if issues are detected

## Monitoring and Logging

### CloudWatch Integration

The ECS service automatically integrates with CloudWatch:

- **Container Insights**: Enable for detailed metrics
- **Log Groups**: Automatically created for container logs
- **Alarms**: Set up alarms for key metrics

### Health Checks

Configure health checks using the `/status` endpoint:

```json
{
  "healthCheck": {
    "command": ["CMD-SHELL", "curl -f http://localhost/status || exit 1"],
    "interval": 30,
    "timeout": 5,
    "retries": 3,
    "startPeriod": 60
  }
}
```

## Security Best Practices

### Network Security

1. **VPC Configuration**: Use private subnets for tasks when possible
2. **Security Groups**: Implement least-privilege access rules
3. **NACLs**: Add network-level access controls
4. **WAF**: Consider using AWS WAF for additional protection

### IAM Security

1. **Least Privilege**: Grant only necessary permissions
2. **Role Separation**: Use separate roles for different environments
3. **Policy Validation**: Regularly review and validate IAM policies
4. **Access Logging**: Enable CloudTrail for API access logging

### Data Security

1. **Encryption**: Enable encryption in transit and at rest
2. **Secrets Management**: Use AWS Secrets Manager for sensitive data
3. **Certificate Management**: Regularly rotate SSL certificates
4. **Backup**: Implement backup strategies for critical data

## Troubleshooting

### Common Issues

1. **Service Won't Start**: Check task definition and IAM permissions
2. **Load Balancer Issues**: Verify target group health checks
3. **DNS Resolution**: Check Route53 configuration and propagation
4. **SSL Certificate**: Verify ACM certificate validation

### Debugging Commands

Use AWS CLI to debug issues:

```bash
# Check service status
aws ecs describe-services --cluster graph-explorer-cluster --services graph-explorer-service

# View task logs
aws logs get-log-events --log-group-name /ecs/graph-explorer --log-stream-name ecs/graph-explorer/task-id

# Check load balancer health
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:region:account:targetgroup/tg-name
```

### Performance Optimization

1. **Task Resources**: Adjust CPU and memory based on usage patterns
2. **Auto Scaling**: Configure appropriate scaling policies
3. **Load Balancer**: Optimize load balancer settings
4. **Database Connections**: Tune connection pooling and timeouts

For additional troubleshooting, see the
[Common Issues](../troubleshooting/1-common-issues.md) guide.
