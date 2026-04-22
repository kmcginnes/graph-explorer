import localForage from "localforage";

import type { ConfigurationId } from "@/core";

import { logger } from "@/utils";

import type { LocalDataPayload } from "./types";

const LOCAL_DATA_PREFIX = "local-data:";

function storageKey(connectionId: ConfigurationId): string {
  return `${LOCAL_DATA_PREFIX}${connectionId}`;
}

/** Saves a local data payload to IndexedDB, keyed by connection ID. */
export async function saveLocalData(
  connectionId: ConfigurationId,
  payload: LocalDataPayload,
): Promise<void> {
  logger.debug("[Local Data Storage] Saving data for connection", connectionId);
  await localForage.setItem(storageKey(connectionId), payload);
}

/** Loads a local data payload from IndexedDB by connection ID. */
export async function loadLocalData(
  connectionId: ConfigurationId,
): Promise<LocalDataPayload | null> {
  logger.debug(
    "[Local Data Storage] Loading data for connection",
    connectionId,
  );
  return localForage.getItem<LocalDataPayload>(storageKey(connectionId));
}

/** Removes a local data payload from IndexedDB by connection ID. */
export async function removeLocalData(
  connectionId: ConfigurationId,
): Promise<void> {
  logger.debug(
    "[Local Data Storage] Removing data for connection",
    connectionId,
  );
  await localForage.removeItem(storageKey(connectionId));
}
