import { verticesDetailsQuery } from "@/connector";
import { useExplorer, VertexId, Vertex, toNodeMap } from "@/core";
import { useQueryClient } from "@tanstack/react-query";

/** Fetch the details if the vertex is a fragment. */
export function useMaterializeVertices() {
  const queryClient = useQueryClient();
  const explorer = useExplorer();

  return async (vertices: Map<VertexId, Vertex>) => {
    const response = await queryClient.ensureQueryData(
      verticesDetailsQuery(vertices.keys().toArray(), explorer)
    );

    return toNodeMap(response.vertices);
  };
}
