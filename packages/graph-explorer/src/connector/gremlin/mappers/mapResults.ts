import { Vertex, Edge, toNodeMap, toEdgeMap, createVertex } from "@/core";
import { GAnyValue } from "../types";
import mapApiEdge from "./mapApiEdge";
import mapApiVertex from "./mapApiVertex";
import { MapValue, ScalarValue, toMappedQueryResults } from "@/connector";
import { chunk } from "lodash";

export function mapResults(data: GAnyValue) {
  const values = mapAnyValue(data);
  return mapToQueryResults(values);
}

function mapToQueryResults(values: MapAnyValueResult[]) {
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
        createVertex({ id: edge.source, types: edge.sourceTypes })
      );
    }

    if (!vertexMap.has(edge.target)) {
      vertexMap.set(
        edge.target,
        createVertex({ id: edge.target, types: edge.targetTypes })
      );
    }
  }

  const vertices = vertexMap.values().toArray();
  const edges = edgeMap.values().toArray();

  // Scalars should not be deduplicated
  const scalars = values.filter(s => "scalar" in s).map(s => s.scalar);

  const maps = values
    .filter(m => "map" in m)
    .map(m => m.map)
    .filter(m => m.size > 0);

  return toMappedQueryResults({ vertices, edges, scalars, maps });
}

type MapAnyValueResult =
  | { vertex: Vertex }
  | { edge: Edge }
  | { scalar: ScalarValue }
  | { map: MapValue };

function mapAnyValue(data: GAnyValue): Array<MapAnyValueResult> {
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
    return [{ map: mapGMap(data["@value"]) }];
  } else if (data["@type"] === "g:List" || data["@type"] === "g:Set") {
    return data["@value"].flatMap((item: GAnyValue) => mapAnyValue(item));
  }

  // Unsupported type
  return [];
}

function mapGMap(data: GAnyValue[]): MapValue {
  // Chunk in to key value pairs, then create an object
  return new Map(
    chunk(data, 2)
      .map(([key, value]) => {
        // Only support scalar keys and values
        const scalarKey = mapAnyValue(key)
          .filter(s => "scalar" in s)
          .map(s => s.scalar)[0];
        const scalarOrMapValue = mapAnyValue(value)
          .map(s => {
            if ("scalar" in s) {
              return s.scalar;
            } else if ("map" in s) {
              return s.map;
            }
          })
          .filter(s => s != null)[0];
        return [scalarKey, scalarOrMapValue] as const;
      })
      .filter(([key, value]) => key != null && value != null)
  );
}
