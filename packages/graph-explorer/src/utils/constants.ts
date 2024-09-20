import { env } from "./env";

export const DEFAULT_SERVICE_TYPE = "neptune-db";
export const DEFAULT_FETCH_TIMEOUT = 240000;
export const DEFAULT_NODE_EXPAND_LIMIT = 500;
export const DEFAULT_CONCURRENT_REQUESTS_LIMIT = 10;

/** The string "Graph Explorer". */
export const APP_NAME = "Graph Explorer";

/** The root URL for the app used for reloading fresh. */
export const RELOAD_URL =
  env.BASE_URL.substring(-1) !== "/" ? env.BASE_URL + "/" : env.BASE_URL;
