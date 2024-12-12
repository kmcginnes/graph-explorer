import dotenv from "dotenv";
import path from "path";
import { clientRoot } from "./paths.js";
import { z } from "zod";

/** Coerces a string to a boolean value in a case insensitive way. */
export const BooleanStringSchema = z
  .string()
  .refine(s => s.toLowerCase() === "true" || s.toLowerCase() === "false")
  .transform(s => s.toLowerCase() === "true");

// Define a required schema for the values we expect along with their defaults
const EnvironmentValuesSchema = z.object({
  GRAPH_EXP_REVISED_PUBLIC_SERVER_URL: z
    .string()
    .url()
    .default("http://localhost"),
  GRAPH_EXP_REVISED_CERTIFICATE_HOSTNAME: z.string().default("localhost"),
  GRAPH_EXP_REVISED_HTTPS: BooleanStringSchema.default("false"),
  GRAPH_EXP_REVISED_PORT: z.coerce.number().optional(),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("debug"),
  LOG_STYLE: z.enum(["cloudwatch", "default"]).default("default"),
});

// Load environment variables from .env file.
dotenv.config({
  path: [path.join(clientRoot, ".env.local"), path.join(clientRoot, ".env")],
});

// Parse the environment values from the process
const parsedEnvironmentValues = EnvironmentValuesSchema.safeParse(process.env);

if (!parsedEnvironmentValues.success) {
  console.error("Failed to parse environment values");
  const flattenedErrors = parsedEnvironmentValues.error.flatten();
  console.error(flattenedErrors.fieldErrors);
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log("Parsed environment values:", parsedEnvironmentValues.data);

// Adds all environment values to local object
export const env = {
  ...parsedEnvironmentValues.data,
};
