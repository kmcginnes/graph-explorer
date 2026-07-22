# Local Sandbox

Spin up Graph Explorer against a local Gremlin Server preloaded with the
[air routes dataset](https://tinkerpop.apache.org/docs/3.8.1/upgrade/#air-routes-dataset).
The database runs in Docker; the app runs on your host with hot reload.

A default connection is pre-configured, so you should **not** need to fill out
any connection form — the graph is ready to explore as soon as the app loads.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (or a compatible runtime)
- [Node](https://nodejs.org) `24.16.0` — the version in [`.nvmrc`](../.nvmrc)
- [pnpm](https://pnpm.io) `11.9.0` via Corepack

## Setup

1. Enable Corepack and select the pinned Node version (from the repo root):

   ```sh
   corepack enable
   nvm use
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Start the Gremlin Server database (from this `sandbox/` directory):

   ```sh
   docker compose up -d
   ```

   This serves Gremlin over HTTP at `http://localhost:8182`. The air routes
   data is generated at startup and is not persisted between restarts.

4. Start the app (from the repo root):

   ```sh
   pnpm dev
   ```

5. Open <http://localhost:5173>.

## Smoke test

You're ready when:

- The app loads at <http://localhost:5173> **without** prompting you to fill
  out a connection form.
- Opening the graph and searching lets you see airport nodes and route edges.

If either fails, stop and resolve it before continuing.

## How it fits together

- `sandbox/docker-compose.yaml` runs `tinkerpop/gremlin-server:3.8` with the
  config and loader under `sandbox/sample/`.
- `packages/graph-explorer/.env.local` pins the dev ports: Vite on `5173`, the
  proxy server on `8181` (off the privileged port `80`).
- `packages/graph-explorer/defaultConnection.json` pre-seeds the "Default
  Connection" (Gremlin, proxy mode) pointing at `http://localhost:8182`.

## Shut down

```sh
docker compose down
```
