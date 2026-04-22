import { useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect } from "react";

import { activeConfigurationAtom, activeConnectionAtom } from "@/core";
import { localDataCacheAtom } from "@/core/connector";
import { logger } from "@/utils";

import { inferAndStoreSchema } from "./inferSchema";
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

      const dataset = { vertices: result.vertices, edges: result.edges };

      set(localDataCacheAtom, dataset);
      await inferAndStoreSchema(get, set, connectionId, dataset);
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
