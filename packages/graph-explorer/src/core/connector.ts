import LoggerConnector from "../connector/LoggerConnector";
import { createGremlinExplorer } from "../connector/gremlin/gremlinExplorer";
import { createOpenCypherExplorer } from "../connector/openCypher/openCypherExplorer";
import { createSparqlExplorer } from "../connector/sparql/sparqlExplorer";
import { mergedConfigurationSelector } from "./StateProvider/configuration";
import { atom } from "jotai";
import { env } from "../utils";
import { ConnectionConfig } from "./ConfigurationProvider";

/**
 * Active connection where the value will only change when one of the
 * properties we care about are changed.
 */
// TODO: Figure out if equalSelector logic was necessary
export const activeConnectionSelector = atom(async get => {
  const config = await get(mergedConfigurationSelector);
  return config?.connection;
});

/**
 * Active connection URL
 */
// TODO: Figure out if equalSelector logic was necessary
const activeConnectionUrlSelector = atom(async get => {
  const config = await get(mergedConfigurationSelector);
  return config?.connection?.url;
});

/**
 * Explorer based on the active connection.
 */
export const explorerSelector = atom(async get => {
  const connection = await get(activeConnectionSelector);

  if (!connection) {
    return null;
  }
  switch (connection.queryEngine) {
    case "openCypher":
      return createOpenCypherExplorer(connection);
    case "sparql":
      return createSparqlExplorer(connection, new Map());
    default:
      return createGremlinExplorer(connection);
  }
});

/**
 * Logger based on the active connection proxy URL.
 */
export const loggerSelector = atom(async get => {
  const url = await get(activeConnectionUrlSelector);
  if (!url) {
    return null;
  }

  return new LoggerConnector(url, {
    enable: env.PROD,
  });
});
