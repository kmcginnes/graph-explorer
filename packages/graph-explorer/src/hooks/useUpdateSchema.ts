import { useAtomCallback } from "jotai/utils";
import type { SchemaResponse } from "../connector/useGEFetchTypes";
import { schemaAtom } from "../core/StateProvider/schema";
import { useCallback } from "react";

const useUpdateSchema = () => {
  return useAtomCallback(
    useCallback(
      (
        get,
        set,
        id: string,
        schema?:
          | Partial<SchemaResponse>
          | ((prevSchema?: SchemaResponse) => Partial<SchemaResponse>)
      ) => {
        set(schemaAtom, async prevSchemaMap => {
          const resolvedPrevSchemaMap = await prevSchemaMap;
          const updatedSchema = new Map(resolvedPrevSchemaMap);
          const prevSchema = resolvedPrevSchemaMap.get(id);

          const currentSchema =
            typeof schema === "function" ? schema(prevSchema) : schema;

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

          updatedSchema.set(id, {
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
      },
      []
    )
  );
};

export default useUpdateSchema;
