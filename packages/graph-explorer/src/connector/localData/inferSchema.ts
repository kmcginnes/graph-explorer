import type { Getter, Setter } from "jotai";

import type { ConfigurationId } from "@/core";

import { schemaAtom } from "@/core";
import { logger } from "@/utils";

import type { LocalDataset } from "./localDataExplorer";

import { createLocalDataExplorer } from "./localDataExplorer";

/**
 * Infers the schema from a local dataset and stores it in the schema atom.
 * Skips if a schema with lastUpdate already exists for this connection.
 */
export async function inferAndStoreSchema(
  get: Getter,
  set: Setter,
  connectionId: ConfigurationId,
  dataset: LocalDataset,
) {
  const schemaMap = get(schemaAtom);
  const existingSchema = schemaMap.get(connectionId);
  if (existingSchema?.lastUpdate) {
    logger.debug("[Local Data] Schema already exists, skipping inference");
    return;
  }

  const tempExplorer = createLocalDataExplorer(
    {
      url: "",
      graphDbUrl: "",
      queryEngine: "localData",
      proxyConnection: false,
      awsAuthEnabled: false,
    },
    dataset,
  );
  const schema = await tempExplorer.fetchSchema();

  set(schemaAtom, prev => {
    const updated = new Map(prev);
    updated.set(connectionId, {
      vertices: schema.vertices.map(v => ({
        type: v.type,
        attributes: v.attributes.map(a => ({
          name: a.name,
          dataType: a.dataType,
        })),
        total: v.total,
      })),
      edges: schema.edges.map(e => ({
        type: e.type,
        attributes: e.attributes.map(a => ({
          name: a.name,
          dataType: a.dataType,
        })),
        total: e.total,
      })),
      edgeConnections: schema.edgeConnections,
      totalVertices: schema.totalVertices,
      totalEdges: schema.totalEdges,
      lastUpdate: new Date(),
      lastSyncFail: false,
    });
    return updated;
  });

  logger.debug("[Local Data] Schema inferred and stored");
}
