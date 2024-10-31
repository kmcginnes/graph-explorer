import { Vertex } from "@/@types/entities";
import { vertexNeighborsSelector } from "@/core/StateProvider/entitiesSelector";
import { useRecoilValue } from "recoil";
import { useUpdateNodeCountsQuery } from "./useUpdateNodeCounts";

export function useNeighborCounts(vertex: Vertex) {
  const expandedNeighbors = useRecoilValue(vertexNeighborsSelector(vertex.id));
  const query = useUpdateNodeCountsQuery(vertex.id, vertex.idType);

  const totalNeighbors = query.data?.totalCount ?? null;
  const unfetchedNeighbors =
    totalNeighbors && totalNeighbors > 0
      ? totalNeighbors - expandedNeighbors.uniqueNeighbors.size
      : null;

  const totalNeighborsByType = new Map(
    Object.entries(query.data?.counts ?? {})
  );

  const totalFetchedNeighborsByType = new Map(
    expandedNeighbors.byType.entries().map(([type, set]) => [type, set.size])
  );

  return {
    totalNeighbors,
    totalFetchedNeighbors: expandedNeighbors.uniqueNeighbors.size,
    totalUnfetchedNeighbors: unfetchedNeighbors,
    totalNeighborsByType,
    totalFetchedNeighborsByType,
  };
}
