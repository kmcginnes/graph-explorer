import { VertexId } from "@/@types/entities";
import { nodeCountsSelector } from "@/core/StateProvider/nodes";
import { useRecoilValue, useSetRecoilState } from "recoil";

export function useNodeCounts(vertexId: VertexId) {
  return useRecoilValue(nodeCountsSelector(vertexId));
}

export function useSetNodeCounts(vertexId: VertexId) {
  return useSetRecoilState(nodeCountsSelector(vertexId));
}
