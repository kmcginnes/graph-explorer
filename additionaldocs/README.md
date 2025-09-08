# Graph Explorer Documentation

Welcome to the Graph Explorer documentation. This guide will help you get
started with Graph Explorer and explore its features.

## Quick Start

New to Graph Explorer? Start here:

- **[Installation](getting-started/1-installation.md)** - Set up Graph Explorer
  locally or with Docker
- **[First Connection](getting-started/2-first-connection.md)** - Connect to
  your first graph database
- **[Basic Usage](getting-started/3-basic-usage.md)** - Learn the essential
  features

## User Guide

Learn how to use Graph Explorer effectively:

- **[Managing Connections](user-guide/1-connections.md)** - Create and manage
  database connections
- **[Graph Visualization](user-guide/2-graph-visualization.md)** - Explore and
  visualize your graph data
- **[Data Explorer](user-guide/3-data-explorer.md)** - Browse data in tabular
  format
- **[Authentication](user-guide/4-authentication.md)** - Set up secure
  connections with AWS IAM

## Deployment

Deploy Graph Explorer in production:

- **[Docker Deployment](deployment/1-docker.md)** - Production Docker setup and
  configuration
- **[AWS EC2 Deployment](deployment/2-aws-ec2.md)** - Deploy on Amazon EC2
  instances
- **[AWS ECS Deployment](deployment/3-aws-ecs.md)** - Deploy using Amazon ECS
  and Fargate
- **[SageMaker Deployment](deployment/4-sagemaker.md)** - Run on Amazon
  SageMaker notebooks
- **[Configuration](deployment/5-configuration.md)** - Environment variables and
  advanced settings

## Development

Contribute to Graph Explorer:

- **[Contributing](development/1-contributing.md)** - How to contribute to the
  project
- **[Development Setup](development/2-development-setup.md)** - Set up your
  local development environment
- **[Architecture](development/3-architecture.md)** - Technical architecture and
  design decisions

## Troubleshooting

Resolve common issues:

- **[Common Issues](troubleshooting/1-common-issues.md)** - FAQ and general
  troubleshooting
- **[Connection Problems](troubleshooting/2-connection-problems.md)** - Database
  connection issues
- **[Performance](troubleshooting/3-performance.md)** - Performance optimization
  and tuning

## Additional Resources

- **[Samples](../samples/)** - Example configurations and Docker Compose files
- **[Changelog](../Changelog.md)** - Release notes and version history
- **[Roadmap](../ROADMAP.md)** - Future development plans
- **[Contributing Guidelines](../CONTRIBUTING.md)** - Contribution process and
  guidelines
- **[Code of Conduct](../CODE_OF_CONDUCT.md)** - Community guidelines

## Getting Help

- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and get community support
- **Documentation**: Search through all documentation sections

## Supported Databases

Graph Explorer supports multiple graph database types:

- **Amazon Neptune** (Gremlin, openCypher, SPARQL)
- **Apache TinkerPop Gremlin Server**
- **BlazeGraph** (SPARQL)
- **Other SPARQL 1.1 compliant databases**

## Key Features

- **Visual Graph Exploration**: Interactive graph visualization with multiple
  layout options
- **Multiple Query Languages**: Support for Gremlin, openCypher, and SPARQL
- **No-Code Data Exploration**: Point-and-click interface for exploring graph
  data
- **AWS Integration**: Native support for Amazon Neptune with IAM authentication
- **Flexible Deployment**: Docker, cloud, and local deployment options
- **Export Capabilities**: Save graphs and export data for further analysis
