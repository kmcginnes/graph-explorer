# Interview Setup

Spin up Graph Explorer against a local Gremlin Server preloaded with the
[air routes dataset](https://tinkerpop.apache.org/docs/3.8.1/upgrade/#air-routes-dataset).
The database runs in Docker; the app runs on your host with hot reload.

All commands below are run from the **repository root**.

A default connection is pre-configured, so you should **not** need to fill out
any connection form — the graph is ready to explore as soon as the app loads.

## Prerequisites

- A container runtime that provides the `docker compose` command — [Docker
  Desktop](https://docs.docker.com/get-docker/), or a compatible alternative
  such as [Podman](https://podman.io) or [Colima](https://github.com/abiosoft/colima)
- [Node](https://nodejs.org) `24.16.0` (the version in [`.nvmrc`](./.nvmrc))
  active in your shell. Use whatever version manager you prefer — nvm, fnm,
  asdf, etc. — from the repo root to pick it up automatically, e.g. `nvm use`
  or `fnm use`.

## Setup

1. Enable Corepack (so the pinned pnpm version is used) and install
   dependencies:

   ```sh
   corepack enable
   pnpm install
   ```

2. Start the Gremlin Server database:

   ```sh
   docker compose -f sandbox/docker-compose.yaml up -d
   ```

   This serves Gremlin over HTTP at `http://localhost:8282`. Give it a few
   seconds to finish loading the air routes data before you run queries. The
   data lives only in memory, so each restart of the container rebuilds it from
   scratch — nothing you change in the graph is saved.

3. Start the app:

   ```sh
   pnpm dev
   ```

4. Open <http://localhost:5173>. The first load takes a bit while Vite
   optimizes dependencies; subsequent loads are fast.

## Smoke test

The Graph View starts empty — search finds data, then you add it to the
canvas. Confirm the environment is wired up correctly:

1. The app loads at <http://localhost:5173> **without** prompting you to fill
   out a connection form.
2. In the **Search** sidebar panel (**Filter** tab), searching returns
   results (airports).
3. Adding a result to the canvas works — click a result's **+** button, or
   **Add All** at the top of the results list — and the node appears.

If any step fails, stop and resolve it before continuing.

Once it's working, the [Getting Started guide](./docs/getting-started/README.md)
is a short hands-on tutorial for the same air routes data — searching, expanding
neighbors to draw route edges, filtering, and styling. Its in-app steps apply
here; just use <http://localhost:5173> instead of the port it mentions.

## Troubleshooting

**Port already in use.** This sandbox uses three host ports: `5173` (app),
`8181` (proxy server), and `8282` (database). If a port is occupied, that
service won't start or the app won't connect. Free the port, or change it —
the app and proxy ports live in `packages/graph-explorer/.env.local`, and the
database port is the left-hand side of the mapping in
`sandbox/docker-compose.yaml`. If you change the database port, update
`GRAPH_EXP_CONNECTION_URL` in `packages/graph-explorer/defaultConnection.json`
to match.

For more, see the [configuration reference](./docs/references/configuration.md),
the [development guide](./docs/development.md), and the
[troubleshooting guide](./docs/guides/troubleshooting.md).

## Shut down

Stop the app with `Ctrl-C` in the terminal running `pnpm dev`, then stop the
database:

```sh
docker compose -f sandbox/docker-compose.yaml down
```

---

# Graph Explorer

Graph Explorer is a React-based web application that makes it easy to visualize and explore graph data, no query language knowledge required. Search for nodes, expand connections, and discover relationships across your graph database through an intuitive visual interface.

Connect to graph databases that support [Apache TinkerPop Gremlin](https://tinkerpop.apache.org/) or [W3C RDF/SPARQL](https://www.w3.org/TR/sparql11-overview/) over HTTP, or [openCypher](https://opencypher.org) via [Amazon Neptune](https://aws.amazon.com/neptune/).

## Explore Your Data

Graph Explorer provides three integrated views for working with your graph database, all in one app.

### Graph View

Search, visualize, and explore connections between nodes with an interactive graph layout. Expand neighbors, filter by type, and run custom queries, all from a single view.

![Graph Explorer showing an interactive visualization of airport routes with search, table view, and node details](./images/graph-explorer.png)

### Data Explorer

Browse all nodes for a given type in a paginated table. View every property at a glance and send nodes directly to the graph view for further exploration.

![Data Explorer showing a tabular view of airport nodes with properties like city, code, and coordinates](./images/data-explorer.png)

### Schema Explorer

Understand your data model at a glance. See node types, their relationships, and property details rendered as an interactive schema graph.

![Schema Explorer showing the relationships between airport, country, continent, and version node types](./images/schema-explorer.png)

## Get Started

- [Hands-on tutorial](./docs/getting-started/README.md) — Try Graph Explorer with sample data using Docker Compose
- [Deployment & connection guides](./docs/guides) — Run with Docker, EC2, ECS Fargate, or SageMaker and connect to your database
- [Development](./docs/development.md) — Build from source for local development

## Documentation

See the [full documentation](./docs) for features, guides, references, and more.

## Community

- [Roadmap](./ROADMAP.md) — See what's planned
- [Changelog](./Changelog.md) — Recent releases
- [Discussions](https://github.com/aws/graph-explorer/discussions) — Ask questions and share ideas
- [Submit an Issue](https://github.com/aws/graph-explorer/issues/new/choose) — Report bugs or request features

## Contributing

See [CONTRIBUTING](./CONTRIBUTING.md) for more information.

## License

This project is licensed under the Apache-2.0 License.
