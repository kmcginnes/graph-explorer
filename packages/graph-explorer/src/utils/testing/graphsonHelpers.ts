import {
  GAnyValue,
  GEdge,
  GInt32,
  GInt64,
  GList,
  GMap,
  GProperty,
  GVertex,
} from "@/connector/gremlin/types";
import { Edge, EdgeId, getRawId, Vertex, VertexId } from "@/core";

export function createGremlinResponseFromVertex(vertex: Vertex) {
  return {
    result: {
      data: createGList([createGVertex(vertex)]),
    },
  };
}

export function createGList(items: GAnyValue[]): GList {
  return {
    "@type": "g:List",
    "@value": items,
  };
}

export function createGMap(map: Map<string, GAnyValue>): GMap {
  return {
    "@type": "g:Map",
    "@value": map
      .entries()
      .flatMap(([key, value]) => [key, value])
      .toArray(),
  };
}

export function createGVertex(vertex: Vertex): GVertex {
  // Create graphSON ID value
  const id = createIdValue(vertex.id);

  return {
    "@type": "g:Vertex",
    "@value": {
      id,
      label: vertex.types.join("::"),
      properties: vertex.__isFragment
        ? undefined
        : createGVertexProperties(vertex.attributes),
    },
  };
}

export function createGEdge(edge: Edge): GEdge {
  return {
    "@type": "g:Edge",
    "@value": {
      id: createIdValue(edge.id),
      label: edge.type,
      inVLabel: edge.targetTypes.join("::"),
      outVLabel: edge.sourceTypes.join("::"),
      inV: createIdValue(edge.target),
      outV: createIdValue(edge.source),
      properties: edge.__isFragment
        ? undefined
        : createGProperties(edge.attributes),
    },
  };
}

function createGVertexProperties(
  attributes: Vertex["attributes"]
): GVertex["@value"]["properties"] {
  const mapped = Object.entries(attributes).map(([key, value]) => ({
    "@type": "g:VertexProperty",
    "@value": {
      label: key,
      value: typeof value === "string" ? value : createGInt64(value),
    },
  }));

  const result = {} as Record<string, any>;
  mapped.forEach(prop => {
    result[prop["@value"].label] = [prop];
  });

  return result;
}

function createGProperties(
  attributes: Edge["attributes"]
): Record<string, GProperty> {
  return Object.entries(attributes)
    .map(
      ([key, value]) =>
        ({
          "@type": "g:Property",
          "@value": {
            key,
            value: typeof value === "string" ? value : createGInt64(value),
          },
        }) satisfies GProperty
    )
    .reduce(
      (result, curr) => {
        result[curr["@value"].key] = curr;
        return result;
      },
      {} as Record<string, GProperty>
    );
}

function createIdValue(id: VertexId | EdgeId) {
  const rawId = getRawId(id);

  if (typeof rawId === "string") {
    return rawId;
  }

  return createGInt64(rawId);
}

export function createGInt64(value: number): GInt64 {
  return {
    "@type": "g:Int64",
    "@value": value,
  };
}

export function createGInt32(value: number): GInt32 {
  return {
    "@type": "g:Int32",
    "@value": value,
  };
}
