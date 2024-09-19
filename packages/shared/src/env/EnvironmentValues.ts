import { BooleanStringSchema } from "../BooleanStringSchema.js";
import { z } from "zod";

// Define a required schema for the values we expect along with their defaults
export const EnvironmentValuesSchema = z.object({
  HOST: z.string().default("localhost"),
  PROXY_SERVER_HTTPS_CONNECTION: BooleanStringSchema.default("false"),
  PROXY_SERVER_HTTPS_PORT: z.coerce.number().default(443),
  PROXY_SERVER_HTTP_PORT: z.coerce.number().default(80),
  PROXY_SERVER_BASE_PATH: z.string().transform(stripTrailingSlash).default(""),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("debug"),
  LOG_STYLE: z.enum(["cloudwatch", "default"]).default("default"),
});

/**
 * Strips trailing slash `/` from string. This will result in empty string for
 * the input string `/`.
 */
function stripTrailingSlash(arg: string | undefined) {
  return arg?.replace(/\/$/, "");
}

export type EnvironmentValues = z.infer<typeof EnvironmentValuesSchema>;
