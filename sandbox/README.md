# Local Sandbox

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
- [Node](https://nodejs.org) `24.16.0` (the version in [`.nvmrc`](../.nvmrc))
  active in your shell. Use whatever version manager you prefer — nvm, fnm,
  asdf, etc. — from the repo root to pick it up automatically, e.g. `nvm use`
  or `fnm use`. (pnpm is not a separate prerequisite; Corepack installs the
  pinned version in the next step.)

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

   This serves Gremlin over HTTP at `http://localhost:8282`. The air routes
   data is generated at startup and is not persisted between restarts.

3. Start the app:

   ```sh
   pnpm dev
   ```

4. Open <http://localhost:5173>.

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

Once it's working, the [Getting Started guide](../docs/getting-started/README.md)
is a short hands-on tutorial for the same air routes data — searching, expanding
neighbors to draw route edges, filtering, and styling. (It's written for the
Docker sample on port `8080`; here the app runs on <http://localhost:5173>, but
every in-app step is identical.)

## How it fits together

- `sandbox/docker-compose.yaml` runs `tinkerpop/gremlin-server:3.8` with the
  config and loader under `sandbox/sample/`.
- `packages/graph-explorer/.env.local` pins the dev ports: Vite on `5173`, the
  proxy server on `8181` (off the privileged port `80`).
- `packages/graph-explorer/defaultConnection.json` pre-seeds the "Default
  Connection" (Gremlin, proxy mode) pointing at `http://localhost:8282`.

## Shut down

```sh
docker compose -f sandbox/docker-compose.yaml down
```
