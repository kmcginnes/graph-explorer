import { useAtomCallback } from "jotai/utils";
import type { SchemaResponse } from "../connector/useGEFetchTypes";
import { schemaAtom } from "../core/StateProvider/schema";
import { useCallback } from "react";

type SchemaUpdate = {
  id: string;
  schema?:
    | Partial<SchemaResponse>
    | ((prevSchema?: SchemaResponse) => Partial<SchemaResponse>);
};

const useUpdateSchema = () => {
  return useAtomCallback(
    useCallback((_get, set, options: SchemaUpdate) => {
      set(schemaAtom, prevSchemaMap => {
        const updatedSchema = new Map(prevSchemaMap);
        const prevSchema = prevSchemaMap.get(options.id);

        const currentSchema =
          typeof options.schema === "function"
            ? options.schema(prevSchema)
            : options.schema;

        // Vertices counts
        const vertices = (currentSchema?.vertices || []).map(vertex => {
          return {
            ...vertex,
            total: vertex.total,
          };
        });

        // Edges counts
        const edges = (currentSchema?.edges || prevSchema?.edges || []).map(
          edge => {
            return {
              ...edge,
              total: edge.total,
            };
          }
        );

        updatedSchema.set(options.id, {
          totalVertices: currentSchema?.totalVertices || 0,
          vertices,
          totalEdges: currentSchema?.totalEdges || 0,
          edges,
          prefixes: prevSchema?.prefixes || [],
          lastUpdate: !currentSchema ? prevSchema?.lastUpdate : new Date(),
          triedToSync: true,
          lastSyncFail: !currentSchema && !!prevSchema,
        });
        return updatedSchema;
      });
    }, [])
  );
};

export default useUpdateSchema;
