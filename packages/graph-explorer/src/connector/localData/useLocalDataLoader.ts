import { useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useEffect } from "react";
import { useCallback } from "react";

import {
  activeConfigurationAtom,
  activeConnectionAtom,
  schemaAtom,
} from "@/core";
import { localDataCacheAtom } from "@/core/connector";
import { logger } from "@/utils";

import { loadLocalData } from "./storage";
import { validateAndTransform } from "./validateAndTransform";

/**
 * Loads local data from IndexedDB when a local data connection is activated.
 * Populates the localDataCacheAtom and infers the schema.
 * Clears the cache when switching away from a local data connection.
 */
export function useLocalDataLoader() {
  const connection = useAtomValue(activeConnectionAtom);

  const loadData = useAtomCallback(
    useCallback(async (get, set) => {
      const connectionId = get(activeConfigurationAtom);
      if (!connectionId) {
        return;
      }

      const payload = await loadLocalData(connectionId);
      if (!payload) {
        logger.debug("[Local Data Loader] No stored data found");
        return;
      }

      const result = validateAndTransform(payload);
      if (!result.success) {
        logger.error("[Local Data Loader] Stored data failed validation");
        return;
      }

      // Populate the in-memory cache
      set(localDataCacheAtom, {
        vertices: result.vertices,
        edges: result.edges,
      });

      // Check if schema already exists
      const schemaMap = get(schemaAtom);
      const existingSchema = schemaMap.get(connectionId);
      if (existingSchema?.lastUpdate) {
        logger.debug(
          "[Local Data Loader] Schema already exists, skipping inference",
        );
        return;
      }

      // Infer schema from the data using the explorer
      const { createLocalDataExplorer } = await import("./localDataExplorer");
      const tempExplorer = createLocalDataExplorer(
        {
          url: "",
          graphDbUrl: "",
          queryEngine: "localData",
          proxyConnection: false,
          awsAuthEnabled: false,
        },
        { vertices: result.vertices, edges: result.edges },
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

      logger.debug("[Local Data Loader] Data loaded and schema inferred");
    }, []),
  );

  const clearCache = useAtomCallback(
    useCallback((_get, set) => {
      set(localDataCacheAtom, null);
    }, []),
  );

  useEffect(() => {
    if (connection?.queryEngine === "localData") {
      void loadData();
    } else {
      clearCache();
    }
  }, [connection?.queryEngine, loadData, clearCache]);
}
