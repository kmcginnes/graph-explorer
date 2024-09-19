import { EnvironmentValuesSchema } from "./EnvironmentValues.js";
import { extractClientUrl, extractServerUrl } from "./extractUrl.js";

test("returns default values when environment is empty", () => {
  const env = EnvironmentValuesSchema.parse({});
  const result = extractServerUrl(env);
  expect(result).toEqual("http://localhost");
});

test("uses provided host name", () => {
  const env = EnvironmentValuesSchema.parse({
    HOST: "www.example.com",
  });
  const result = extractServerUrl(env);
  expect(result).toEqual("http://www.example.com");
});

test("uses provided http port", () => {
  const env = EnvironmentValuesSchema.parse({
    PROXY_SERVER_HTTP_PORT: 3001,
  });
  const result = extractServerUrl(env);
  expect(result).toEqual("http://localhost:3001");
});

test("ignores https port", () => {
  const env = EnvironmentValuesSchema.parse({
    PROXY_SERVER_HTTPS_PORT: 1234,
  });
  const result = extractServerUrl(env);
  expect(result).toEqual("http://localhost");
});

test("uses https", () => {
  const env = EnvironmentValuesSchema.parse({
    PROXY_SERVER_HTTPS_CONNECTION: "true",
  });

  const result = extractServerUrl(env);
  expect(result).toEqual("https://localhost");
});

test("uses https with custom port", () => {
  const env = EnvironmentValuesSchema.parse({
    PROXY_SERVER_HTTPS_CONNECTION: "true",
    PROXY_SERVER_HTTPS_PORT: 1234,
  });

  const result = extractServerUrl(env);
  expect(result).toEqual("https://localhost:1234");
});

test("uses https with custom host and port", () => {
  const env = EnvironmentValuesSchema.parse({
    HOST: "www.example.com",
    PROXY_SERVER_HTTPS_CONNECTION: "true",
    PROXY_SERVER_HTTPS_PORT: 1234,
  });

  const result = extractServerUrl(env);
  expect(result).toEqual("https://www.example.com:1234");
});

test("uses https with custom host, port, and base path", () => {
  const env = EnvironmentValuesSchema.parse({
    HOST: "www.example.com",
    PROXY_SERVER_HTTPS_CONNECTION: "true",
    PROXY_SERVER_HTTPS_PORT: 1234,
    PROXY_SERVER_BASE_PATH: "/proxy/example",
  });

  const result = extractServerUrl(env);
  expect(result).toEqual("https://www.example.com:1234/proxy/example");
});

test("client url adds /explorer", () => {
  const env = EnvironmentValuesSchema.parse({
    HOST: "www.example.com",
    PROXY_SERVER_HTTPS_CONNECTION: "true",
    PROXY_SERVER_HTTPS_PORT: 1234,
    PROXY_SERVER_BASE_PATH: "/proxy/example",
  });

  const result = extractClientUrl(env);
  expect(result).toEqual("https://www.example.com:1234/proxy/example/explorer");
});
