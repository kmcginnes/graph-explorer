import { ConnectionConfig, RawConfiguration } from "../ConfigurationProvider";

export default function migrateConfiguration(
  storedConfigMap: unknown
): Map<string, RawConfiguration> {
  const newMap = new Map<string, RawConfiguration>();

  if (
    typeof storedConfigMap !== "object" ||
    !(storedConfigMap instanceof Map)
  ) {
    return newMap;
  }

  for (const [key, storedConfig] of storedConfigMap) {
    const migratedConfig = migrateConfigEntry(key, storedConfig);
    if (migratedConfig == null) {
      continue;
    }
    newMap.set(key, migratedConfig);
  }

  return newMap;
}

function migrateConfigEntry(
  id: string,
  config: unknown
): RawConfiguration | null {
  if (config == null || typeof config !== "object") {
    return null;
  }

  const newConfig: RawConfiguration = {
    id: "id" in config && typeof config.id === "string" ? config.id : id,
    displayLabel:
      "displayLabel" in config && typeof config.displayLabel === "string"
        ? config.displayLabel
        : undefined,
    __fileBase:
      "__fileBase" in config && typeof config.__fileBase === "boolean"
        ? config.__fileBase
        : undefined,
    connection:
      "connection" in config && typeof config.connection === "object"
        ? migrateConnection(config.connection) ?? undefined
        : undefined,
  };
  return newConfig;
}

function migrateConnection(connection: unknown): ConnectionConfig | null {
  if (connection == null || typeof connection !== "object") {
    return null;
  }

  const dbUrl = (() => {
    if (
      "proxyConnection" in connection &&
      typeof connection.proxyConnection === "boolean" &&
      connection.proxyConnection
    ) {
      if (
        "graphDbUrl" in connection &&
        typeof connection.graphDbUrl === "string"
      ) {
        return connection.graphDbUrl;
      }
    }
    if ("url" in connection && typeof connection.url === "string") {
      return connection.url;
    }
    if (
      "graphDbUrl" in connection &&
      typeof connection.graphDbUrl === "string"
    ) {
      return connection.graphDbUrl;
    }
    return null;
  })();

  const newConnection: ConnectionConfig = {
    awsAuthEnabled:
      "awsAuthEnabled" in connection &&
      typeof connection.awsAuthEnabled === "boolean"
        ? connection.awsAuthEnabled
        : false,
    awsRegion:
      "awsRegion" in connection && typeof connection.awsRegion === "string"
        ? connection.awsRegion
        : undefined,
    fetchTimeoutMs:
      "fetchTimeoutMs" in connection &&
      typeof connection.fetchTimeoutMs === "number"
        ? connection.fetchTimeoutMs
        : undefined,
    graphDbUrl: dbUrl ?? undefined,
    nodeExpansionLimit:
      "nodeExpansionLimit" in connection &&
      typeof connection.nodeExpansionLimit === "number"
        ? connection.nodeExpansionLimit
        : undefined,
    queryEngine:
      "queryEngine" in connection && typeof connection.queryEngine === "string"
        ? toQueryEngine(connection.queryEngine)
        : undefined,
    serviceType:
      "serviceType" in connection && typeof connection.serviceType === "string"
        ? toServiceType(connection.serviceType)
        : undefined,
  };
  return newConnection;
}

function toQueryEngine(value: string): ConnectionConfig["queryEngine"] {
  switch (value) {
    case "gremlin":
      return "gremlin";
    case "openCypher":
      return "openCypher";
    case "sparql":
      return "sparql";
    default:
      return "gremlin";
  }
}

function toServiceType(value: string): ConnectionConfig["serviceType"] {
  switch (value) {
    case "neptune-db":
      return "neptune-db";
    case "neptune-graph":
      return "neptune-graph";
    default:
      return "neptune-db";
  }
}
