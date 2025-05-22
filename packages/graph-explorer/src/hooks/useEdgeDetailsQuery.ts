import { edgeDetailsQuery } from "@/connector";
import { EdgeId, useExplorer } from "@/core";
import { useQuery } from "@tanstack/react-query";

export function useEdgeDetailsQuery(edgeId: EdgeId) {
  const explorer = useExplorer();
  return useQuery(edgeDetailsQuery(edgeId, explorer));
}
