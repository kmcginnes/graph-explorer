import {
  EnvironmentValues,
  EnvironmentValuesSchema,
} from "./EnvironmentValues.js";

const defaultValues: EnvironmentValues = {
  HOST: "localhost",
  LOG_LEVEL: "debug",
  LOG_STYLE: "default",
  PROXY_SERVER_HTTPS_CONNECTION: false,
  PROXY_SERVER_HTTP_PORT: 80,
  PROXY_SERVER_HTTPS_PORT: 443,
  PROXY_SERVER_BASE_PATH: "",
};

test("parses environment values", () => {
  const env = EnvironmentValuesSchema.parse({
    HOST: "www.example.com",
    PROXY_SERVER_HTTPS_CONNECTION: "true",
    PROXY_SERVER_HTTPS_PORT: 1234,
    PROXY_SERVER_BASE_PATH: "/proxy/example",
  });

  expect(env).toEqual({
    ...defaultValues,
    HOST: "www.example.com",
    PROXY_SERVER_HTTPS_CONNECTION: true,
    PROXY_SERVER_HTTPS_PORT: 1234,
    PROXY_SERVER_BASE_PATH: "/proxy/example",
  } satisfies EnvironmentValues);
});

test("handles base path with empty string", () => {
  const env = EnvironmentValuesSchema.parse({
    PROXY_SERVER_BASE_PATH: "",
  });

  expect(env).toEqual(defaultValues);
});

test("handles base path with just a slash", () => {
  const env = EnvironmentValuesSchema.parse({
    PROXY_SERVER_BASE_PATH: "/",
  });

  expect(env).toEqual(defaultValues);
});
