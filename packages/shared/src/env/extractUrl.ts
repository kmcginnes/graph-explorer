import { EnvironmentValues } from "./EnvironmentValues.js";

export const CLIENT_PATH = "/explorer";

export function extractServerUrl(env: EnvironmentValues) {
  // Get the port numbers to listen on
  const host = env.HOST;
  const httpPort = env.PROXY_SERVER_HTTP_PORT;
  const httpsPort = env.PROXY_SERVER_HTTPS_PORT;
  const useHttps = env.PROXY_SERVER_HTTPS_CONNECTION;

  const scheme = useHttps ? "https" : "http";
  let port = "";

  // Only show the port if it is not one of the defaults
  if (useHttps && httpsPort !== 443) {
    port = `:${httpsPort}`;
  } else if (!useHttps && httpPort !== 80) {
    port = `:${httpPort}`;
  }

  const basePath = env.PROXY_SERVER_BASE_PATH ?? "";

  const baseUrl = `${scheme}://${host}${port}${basePath}`;

  return baseUrl;
}

export function extractClientUrl(env: EnvironmentValues) {
  const baseUrl = extractServerUrl(env);

  return `${baseUrl}${CLIENT_PATH}`;
}
