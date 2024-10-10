import { every, isEqual } from "lodash";
import {
  ClientLoggerConnector,
  LoggerConnector,
  ServerLoggerConnector,
} from "@/connector/LoggerConnector";
import { createGremlinExplorer } from "@/connector/gremlin/gremlinExplorer";
import { createOpenCypherExplorer } from "@/connector/openCypher/openCypherExplorer";
import { createSparqlExplorer } from "@/connector/sparql/sparqlExplorer";
import { mergedConfigurationSelector } from "./StateProvider/configuration";
import { selector } from "recoil";
import { equalSelector } from "@/utils/recoilState";
import { ConnectionConfig } from "@shared/types";
import { logger } from "@/utils";
import { featureFlagsSelector } from "./featureFlags";

/**
 * Active connection where the value will only change when one of the
 * properties we care about are changed.
 */
export const activeConnectionSelector = equalSelector({
  key: "activeConnection",
  get: ({ get }) => {
    const config = get(mergedConfigurationSelector);
    return config?.connection;
  },
  equals: (latest, prior) => {
    if (Object.is(latest, prior)) {
      return true;
    }
    if (latest == null || prior == null) {
      return false;
    }
    const attrs = [
      "url",
      "queryEngine",
      "proxyConnection",
      "graphDbUrl",
      "awsAuthEnabled",
      "awsRegion",
      "fetchTimeoutMs",
      "nodeExpansionLimit",
    ] as (keyof ConnectionConfig)[];
    return every(attrs, attr => isEqual(latest[attr] as string, prior[attr]));
  },
});

/**
 * Explorer based on the active connection.
 */
export const explorerSelector = selector({
  key: "explorer",
  get: ({ get }) => {
    const connection = get(activeConnectionSelector);
    const featureFlags = get(featureFlagsSelector);

    if (!connection) {
      return null;
    }
    switch (connection.queryEngine) {
      case "openCypher":
        return createOpenCypherExplorer(connection, featureFlags);
      case "sparql":
        return createSparqlExplorer(connection, featureFlags, new Map());
      default:
        return createGremlinExplorer(connection, featureFlags);
    }
  },
});

// TODO: Remove this selector as it is no longer necessary

/**
 * Logger based on the active connection proxy URL.
 */
export const loggerSelector = selector<LoggerConnector>({
  key: "logger",
  get: () => createLoggerFromConnection(),
});

/** Creates a logger instance that will be remote if the connection is using the
 * proxy server. Otherwise it will be a client only logger. */
export function createLoggerFromConnection(): LoggerConnector {
  logger.debug("Creating a remote server logger");
  return new ServerLoggerConnector();
}
