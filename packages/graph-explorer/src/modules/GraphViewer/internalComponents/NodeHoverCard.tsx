import { useDisplayVertex, type VertexId } from "@/core";

export function NodeHoverCard({ vertexId }: { vertexId: VertexId }) {
  const vertex = useDisplayVertex(vertexId);

  return <div>{vertex.displayTypes}</div>;
}
