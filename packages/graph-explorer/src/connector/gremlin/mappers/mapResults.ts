import {
  Vertex,
  Edge,
  toNodeMap,
  toEdgeMap,
  createVertexFragment,
} from "@/core";
import { GAnyValue } from "../types";
import mapApiEdge from "./mapApiEdge";
import mapApiVertex from "./mapApiVertex";
import { ScalarValue, toMappedQueryResults } from "@/connector";

export function mapResults(data: GAnyValue) {
  const values = mapAnyValue(data);

  // Use maps to deduplicate vertices and edges
  const vertexMap = toNodeMap(
    values.filter(e => "vertex" in e).map(e => e.vertex)
  );

  const edgeMap = toEdgeMap(values.filter(e => "edge" in e).map(e => e.edge));

  // Add fragment vertices from the edges if they are missing
  for (const edge of edgeMap.values()) {
    if (!vertexMap.has(edge.source)) {
      vertexMap.set(
        edge.source,
        createVertexFragment(edge.source, edge.sourceTypes)
      );
    }

    if (!vertexMap.has(edge.target)) {
      vertexMap.set(
        edge.target,
        createVertexFragment(edge.target, edge.targetTypes)
      );
    }
  }

  const vertices = vertexMap.values().toArray();
  const edges = edgeMap.values().toArray();

  // Scalars should not be deduplicated
  const scalars = values.filter(s => "scalar" in s).map(s => s.scalar);

  return toMappedQueryResults({ vertices, edges, scalars });
}

function mapAnyValue(
  data: GAnyValue
): Array<{ vertex: Vertex } | { edge: Edge } | { scalar: ScalarValue }> {
  if (typeof data === "string") {
    return [{ scalar: data }];
  } else if (typeof data === "boolean") {
    return [{ scalar: data }];
  } else if (
    data["@type"] === "g:Int32" ||
    data["@type"] === "g:Int64" ||
    data["@type"] === "g:Double"
  ) {
    return [{ scalar: data["@value"] }];
  } else if (data["@type"] === "g:Edge") {
    return [{ edge: mapApiEdge(data) }];
  } else if (data["@type"] === "g:Vertex") {
    return [{ vertex: mapApiVertex(data) }];
  } else if (data["@type"] === "g:Path") {
    return mapAnyValue(data["@value"].objects);
  } else if (data["@type"] === "g:Map") {
    return (
      data["@value"]
        // Skip the keys in the map by skipping even indices
        .filter((_, index) => index % 2 !== 0)
        .flatMap((item: GAnyValue) => mapAnyValue(item))
    );
  } else if (data["@type"] === "g:List" || data["@type"] === "g:Set") {
    return data["@value"].flatMap((item: GAnyValue) => mapAnyValue(item));
  }

  // Unsupported type
  return [];
}
