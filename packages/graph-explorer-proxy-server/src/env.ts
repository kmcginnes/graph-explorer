import dotenv from "dotenv";
import path from "path";
import { clientRoot } from "./paths.js";
import { EnvironmentValuesSchema } from "@graph-explorer/shared/env";

// Adds all environment values to local object
export const env = createEnv();

function createEnv() {
  // Load environment variables from .env file.
  dotenv.config({
    path: [path.join(clientRoot, ".env.local"), path.join(clientRoot, ".env")],
  });

  // Parse the environment values from the process
  const parsedEnvironmentValues = EnvironmentValuesSchema.safeParse(
    process.env
  );

  if (!parsedEnvironmentValues.success) {
    console.error("Failed to parse environment values");
    const flattenedErrors = parsedEnvironmentValues.error.flatten();
    console.error(flattenedErrors.fieldErrors);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log("Parsed environment values:", parsedEnvironmentValues.data);
  return parsedEnvironmentValues.data;
}
