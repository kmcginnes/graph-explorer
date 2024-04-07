import { atomWithStorage } from "jotai/utils";
import {
  EdgeTypeConfig,
  PrefixTypeConfig,
  VertexTypeConfig,
} from "../ConfigurationProvider";

export type SchemaInference = {
  vertices: VertexTypeConfig[];
  edges: EdgeTypeConfig[];
  prefixes?: Array<PrefixTypeConfig>;
  lastUpdate?: Date;
  triedToSync?: boolean;
  lastSyncFail?: boolean;
  totalVertices?: number;
  totalEdges?: number;
};

export const schemaAtom = atomWithStorage<Map<string, SchemaInference>>(
  "schema",
  new Map()
);
