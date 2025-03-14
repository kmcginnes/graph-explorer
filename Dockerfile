# syntax=docker/dockerfile:1

################################################################################
# Create minimal Amazon Linux 2023 base image with Node.js
################################################################################
# Use Amazon Linux 2023 minimal base image
FROM amazonlinux:2023 AS base

# Set environment variables for NVM
ENV NVM_DIR=/root/.nvm
ENV NODE_VERSION=22.14.0
ENV PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"

# Install required dependencies and NVM
RUN yum install -y tar gzip  && \
    mkdir -p $NVM_DIR && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && \
    . "$NVM_DIR/nvm.sh" && \
    nvm install $NODE_VERSION && \
    nvm use $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    yum remove -y tar gzip && \
    yum clean all && \
    rm -rf /var/cache/yum && \
    rm -rf $HOME/.local

################################################################################
# Create builder image
################################################################################

FROM base AS builder
ARG NEPTUNE_NOTEBOOK

ENV HOST=localhost
ENV PROXY_SERVER_HTTPS_CONNECTION=false

ENV NEPTUNE_NOTEBOOK=$NEPTUNE_NOTEBOOK
ENV HOME=/graph-explorer

# Conditionally set the following environment values using +/- variable expansion
# https://docs.docker.com/reference/dockerfile/#environment-replacement
# 
# If NEPTUNE_NOTEBOOK value is set then
#   - GRAPH_EXP_ENV_ROOT_FOLDER = /proxy/9250/explorer
#   - PROXY_SERVER_HTTP_PORT    = 9250
#   - LOG_STYLE                 = cloudwatch
# Else the values are the defaults
#   - GRAPH_EXP_ENV_ROOT_FOLDER = /explorer
#   - PROXY_SERVER_HTTP_PORT    = 80
#   - LOG_STYLE                 = default

ENV GRAPH_EXP_ENV_ROOT_FOLDER=${NEPTUNE_NOTEBOOK:+/proxy/9250/explorer}
ENV GRAPH_EXP_ENV_ROOT_FOLDER=${GRAPH_EXP_ENV_ROOT_FOLDER:-/explorer}

ENV PROXY_SERVER_HTTP_PORT=${NEPTUNE_NOTEBOOK:+9250}
ENV PROXY_SERVER_HTTP_PORT=${PROXY_SERVER_HTTP_PORT:-80}

ENV LOG_STYLE=${NEPTUNE_NOTEBOOK:+cloudwatch}
ENV LOG_STYLE=${LOG_STYLE:-default}

WORKDIR /graph-explorer
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/graph-explorer/package.json ./packages/graph-explorer/
COPY packages/graph-explorer-proxy-server/package.json ./packages/graph-explorer-proxy-server/
COPY packages/shared/package.json ./packages/shared/

RUN npm install --global pnpm@9.15.0 && \
    npm cache clean --force

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build && pnpm clean:dep && pnpm install --prod --ignore-scripts

################################################################################
# Create final image
################################################################################

FROM base AS final
WORKDIR /graph-explorer
COPY --from=builder /graph-explorer/node_modules ./node_modules
COPY --from=builder /graph-explorer/packages/graph-explorer/.env ./packages/graph-explorer/.env
COPY --from=builder /graph-explorer/packages/graph-explorer/node_modules ./packages/graph-explorer/node_modules
COPY --from=builder /graph-explorer/packages/graph-explorer/dist ./packages/graph-explorer/dist
COPY --from=builder /graph-explorer/packages/graph-explorer/package.json ./packages/graph-explorer/package.json
COPY --from=builder /graph-explorer/packages/graph-explorer-proxy-server/dist ./packages/graph-explorer-proxy-server/dist
COPY --from=builder /graph-explorer/packages/graph-explorer-proxy-server/package.json ./packages/graph-explorer-proxy-server/package.json
COPY --from=builder /graph-explorer/packages/graph-explorer-proxy-server/node_modules ./packages/graph-explorer-proxy-server/node_modules
# COPY --from=builder /graph-explorer/packages/shared/dist ./packages/shared/dist
# COPY --from=builder /graph-explorer/packages/shared/node_modules ./packages/shared/node_modules
# COPY --from=builder /graph-explorer/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /graph-explorer/package.json ./package.json
COPY --from=builder /graph-explorer/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /graph-explorer/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /graph-explorer/process-environment.sh ./process-environment.sh
COPY --from=builder /graph-explorer/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod a+x ./process-environment.sh
RUN chmod a+x ./docker-entrypoint.sh

EXPOSE 443
EXPOSE 80
EXPOSE 9250
ENTRYPOINT ["./docker-entrypoint.sh"]
