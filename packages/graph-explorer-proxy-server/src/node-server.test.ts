import { readFile } from "fs/promises";
import { vol } from "memfs";
import path from "path";
import { repoRoot } from "./paths.js";
import { z } from "zod";
import { existsSync } from "fs";
import { createRandomUrlString } from "@graph-explorer/shared/src/utils/testing/index.js";

const existingConfig = {
  PUBLIC_OR_PROXY_ENDPOINT: "https://public-endpoint",
  GRAPH_CONNECTION_URL:
    "https://cluster-cqmizgqgrsbf.us-west-2.neptune.amazonaws.com:8182",
  USING_PROXY_SERVER: true,
  IAM: true,
  SERVICE_TYPE: "neptune-db",
  AWS_REGION: "us-west-2",
  // Possible Values are "gremlin", "sparql", "openCypher"
  GRAPH_TYPE: "gremlin",
  GRAPH_EXP_HTTPS_CONNECTION: true,
  PROXY_SERVER_HTTPS_CONNECTION: true,
  // Measured in milliseconds (i.e. 240000 is 240 seconds or 4 minutes)
  GRAPH_EXP_FETCH_REQUEST_TIMEOUT: 240000,
  GRAPH_EXP_NODE_EXPANSION_LIMIT: 500,
};

const DefaultConnectionConfigFileSchema = z.object({
  PUBLIC_OR_PROXY_ENDPOINT: z.string().url().optional(),
  GRAPH_CONNECTION_URL: z.string().url().optional(),
  USING_PROXY_SERVER: z.boolean().optional(),
  IAM: z.boolean().optional(),
  SERVICE_TYPE: z.string().optional(),
  AWS_REGION: z.string().optional(),
  GRAPH_TYPE: z.string().optional(),
  GRAPH_EXP_HTTPS_CONNECTION: z.boolean().optional(),
  PROXY_SERVER_HTTPS_CONNECTION: z.boolean().optional(),
  GRAPH_EXP_FETCH_REQUEST_TIMEOUT: z.number().optional(),
  GRAPH_EXP_NODE_EXPANSION_LIMIT: z.number().optional(),
});

type DefaultConnectionConfigFile = z.infer<
  typeof DefaultConnectionConfigFileSchema
>;

async function loadConfigFile(): Promise<DefaultConnectionConfigFile | null> {
  try {
    const filePath = path.join(repoRoot, "config.json");

    if (!existsSync(filePath)) {
      console.log("No config.json file found");
      return null;
    }

    const fileContents = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContents) as unknown;
    return DefaultConnectionConfigFileSchema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to load config file", error);
    }
    return null;
  }
}

test("loadConfigFile parses config file", async () => {
  existingConfig.GRAPH_CONNECTION_URL = createRandomUrlString();
  vol.writeFileSync("/repo/config.json", JSON.stringify(existingConfig), {
    encoding: "utf-8",
  });
  const config = await loadConfigFile();
  expect(config).toEqual(existingConfig);
});

test("loadConfigFile return null when no file", async () => {
  const config = await loadConfigFile();
  expect(config).toBeNull();
});

// async function getDefaultConnection() {
//   const configFile = await loadConfigFile();

//   if (configFile) {
//     return {} satisfies ConnectionConfig;
//   }
// }
