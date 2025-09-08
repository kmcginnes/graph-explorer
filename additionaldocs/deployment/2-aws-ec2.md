# AWS EC2 Deployment

This guide covers deploying Graph Explorer on Amazon EC2 instances, including
setup for connecting to Amazon Neptune.

## Overview

The following instructions detail how to deploy Graph Explorer onto an Amazon
EC2 instance and use it as a proxy server with SSH tunneling to connect to
Amazon Neptune.

<!-- prettier-ignore -->
> [!NOTE]
> 
> This documentation is not an official recommendation on
network setups as there are many ways to connect to Amazon Neptune from outside
of the VPC, such as setting up a load balancer or VPC peering.

## Prerequisites

- Provision an Amazon EC2 instance that will be used to host the application and
  connect to Neptune as a proxy server. For more details, see instructions
  [here](https://github.com/aws/graph-notebook/tree/main/additional-databases/neptune).
- Ensure the Amazon EC2 instance can send and receive on ports `22` (SSH),
  `8182` (Neptune), and `443` or `80` depending on protocol used
  (graph-explorer).

## Basic EC2 Setup

### Step 1: Prepare the EC2 Instance

1. Open an SSH client and connect to the EC2 instance.
2. Download and install the necessary command line tools such as
   [Git](https://git-scm.com/downloads) and
   [Docker](https://docs.docker.com/get-docker/).

### Step 2: Install Graph Explorer

#### Option A: Using Pre-built Image

1. Authenticate with Amazon ECR:

   ```bash
   aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
   ```

2. Pull and run the Graph Explorer image:
   ```bash
   docker run -d \
     --name graph-explorer \
     -p 80:80 -p 443:443 \
     --env HOST={ec2-public-hostname-or-ip} \
     --restart unless-stopped \
     public.ecr.aws/neptune/graph-explorer
   ```

#### Option B: Building from Source

1. Clone the repository:

   ```bash
   git clone https://github.com/aws/graph-explorer.git
   cd graph-explorer
   ```

2. Build the image:

   ```bash
   docker build -t graph-explorer .
   ```

   <!-- prettier-ignore -->
   > [!TIP]
   >
   > If you receive an error relating to the docker service not running, run
   > `service docker start`.

3. Run the container:
   ```bash
   docker run -d \
     --name graph-explorer \
     -p 80:80 -p 443:443 \
     --env HOST={ec2-public-hostname-or-ip} \
     --restart unless-stopped \
     graph-explorer
   ```

### Step 3: Access Graph Explorer

1. Navigate to the public URL of your EC2 instance accessing the `/explorer`
   endpoint. The URL will look like this:

   ```
   https://ec2-1-2-3-4.us-east-1.compute.amazonaws.com/explorer
   ```

2. You will receive a warning as the SSL certificate used is self-signed. See
   [HTTPS Connections](../troubleshooting/common-issues.md#https-connections)
   section for instructions on trusting the certificate.

3. After completing the trusted certification step and refreshing the browser,
   you should now see the Connections UI.

## Advanced EC2 Configuration

### Security Groups

Configure your EC2 security group to allow the necessary traffic:

#### Inbound Rules

- **SSH (22)**: Your IP address or corporate network range
- **HTTP (80)**: 0.0.0.0/0 (or restrict to your network)
- **HTTPS (443)**: 0.0.0.0/0 (or restrict to your network)

#### Outbound Rules

- **Neptune (8182)**: Neptune cluster security group
- **HTTPS (443)**: 0.0.0.0/0 (for downloading Docker images)
- **HTTP (80)**: 0.0.0.0/0 (for package updates)

### IAM Role Configuration

For Neptune connections with IAM authentication, attach an IAM role to your EC2
instance:

1. Create an IAM role with Neptune access permissions
2. Attach the role to your EC2 instance
3. Configure Graph Explorer to use IAM authentication

Example IAM policy for Neptune access:

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

### Network Configuration

#### VPC Setup

- Place your EC2 instance in the same VPC as your Neptune cluster
- Use public subnets for EC2 if you need internet access
- Use private subnets for Neptune for security

#### Route Tables

- Ensure proper routing between EC2 and Neptune subnets
- Configure NAT Gateway if EC2 is in private subnet but needs internet access

### SSL Certificate Management

#### Using Let's Encrypt

For production deployments, consider using Let's Encrypt for SSL certificates:

1. Install Certbot on your EC2 instance:

   ```bash
   sudo yum install certbot -y  # Amazon Linux
   # or
   sudo apt-get install certbot -y  # Ubuntu
   ```

2. Generate certificates:

   ```bash
   sudo certbot certonly --standalone -d your-domain.com
   ```

3. Mount certificates in Docker:
   ```bash
   docker run -d \
     --name graph-explorer \
     -p 80:80 -p 443:443 \
     --env HOST=your-domain.com \
     -v /etc/letsencrypt/live/your-domain.com:/graph-explorer/packages/graph-explorer-proxy-server/cert-info \
     --restart unless-stopped \
     public.ecr.aws/neptune/graph-explorer
   ```

#### Custom Domain Setup

1. Register a domain name
2. Create an A record pointing to your EC2 instance's public IP
3. Use the domain name in the `HOST` environment variable

## Production Deployment Considerations

### Auto Scaling

For high availability, consider using Auto Scaling Groups:

1. Create an AMI with Graph Explorer pre-installed
2. Set up an Auto Scaling Group with the AMI
3. Configure a load balancer to distribute traffic

### Monitoring and Logging

#### CloudWatch Integration

1. Install the CloudWatch agent on your EC2 instance
2. Configure log forwarding for Docker containers:
   ```bash
   docker run -d \
     --name graph-explorer \
     --log-driver=awslogs \
     --log-opt awslogs-group=graph-explorer \
     --log-opt awslogs-region=us-west-2 \
     -p 80:80 -p 443:443 \
     --env HOST={hostname} \
     public.ecr.aws/neptune/graph-explorer
   ```

#### Health Checks

Set up health checks using the `/status` endpoint:

```bash
# Simple health check script
#!/bin/bash
curl -f http://localhost/status || exit 1
```

### Backup and Recovery

#### Configuration Backup

1. Backup your Docker configuration and environment variables
2. Store SSL certificates securely
3. Document your deployment process

#### Disaster Recovery

1. Create AMI snapshots regularly
2. Store configuration in version control
3. Automate deployment using Infrastructure as Code (CloudFormation, Terraform)

## Troubleshooting EC2 Deployment

### Common Issues

1. **Docker Service Not Running**:

   ```bash
   sudo service docker start
   sudo systemctl enable docker
   ```

2. **Port Already in Use**:

   ```bash
   # Check what's using the port
   sudo netstat -tlnp | grep :80

   # Use different ports if needed
   docker run -p 8080:80 -p 8443:443 ...
   ```

3. **Permission Denied**:

   ```bash
   # Add user to docker group
   sudo usermod -a -G docker $USER
   # Log out and back in
   ```

4. **Network Connectivity Issues**:
   - Check security group rules
   - Verify VPC routing
   - Test Neptune connectivity from EC2

### Performance Optimization

1. **Instance Type**: Use instances with adequate CPU and memory
2. **Storage**: Use SSD storage for better I/O performance
3. **Network**: Choose instances with enhanced networking
4. **Placement**: Consider placement groups for low latency

### Monitoring Commands

```bash
# Check container status
docker ps

# View container logs
docker logs graph-explorer

# Monitor resource usage
docker stats graph-explorer

# Check system resources
htop
df -h
```

For additional troubleshooting, see the
[Common Issues](../troubleshooting/1-common-issues.md) guide.
