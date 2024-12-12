#!/bin/bash

# Check if GRAPH_EXP_HTTPS_CONNECTION is true
if [[ "$GRAPH_EXP_HTTPS_CONNECTION" == "true" ]]; then
  PROTOCOL="https"
  PORT="$PROXY_SERVER_HTTPS_PORT"
else
  PROTOCOL="http"
  PORT="$PROXY_SERVER_HTTP_PORT"
fi

# Construct the full URL using the proxy server URL if provided
if [[ -n "$PUBLIC_OR_PROXY_ENDPOINT" ]]; then
  GRAPH_EXP_SERVER_URL="$PUBLIC_OR_PROXY_ENDPOINT"
else
  GRAPH_EXP_SERVER_URL="${PROTOCOL}://$HOST:$PORT"
fi


# Export the new environment variable
export GRAPH_EXP_SERVER_URL