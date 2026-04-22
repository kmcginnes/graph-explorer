/* eslint-disable @typescript-eslint/require-await */
import type {
  Edge,
  EdgeConnection,
  NormalizedConnection,
  Vertex,
  VertexId,
  VertexType,
} from "@/core";

import type {
  CountsByTypeResponse,
  EdgeSchemaResponse,
  Explorer,
  SchemaResponse,
  VertexSchemaResponse,
} from "../useGEFetchTypes";

export type LocalDataset = {
  vertices: Vertex[];
  edges: Edge[];
};

/**
 * Creates an in-memory Explorer that operates on a pre-loaded dataset.
 * All operations use array filtering and map lookups.
 */
export function createLocalDataExplorer(
  connection: NormalizedConnection,
  dataset: LocalDataset,
): Explorer {
  // Build lookup indexes
  const vertexById = new Map(dataset.vertices.map(v => [v.id, v]));
  const edgesBySource = new Map<VertexId, Edge[]>();
  const edgesByTarget = new Map<VertexId, Edge[]>();

  for (const edge of dataset.edges) {
    const sourceEdges = edgesBySource.get(edge.sourceId) ?? [];
    sourceEdges.push(edge);
    edgesBySource.set(edge.sourceId, sourceEdges);

    const targetEdges = edgesByTarget.get(edge.targetId) ?? [];
    targetEdges.push(edge);
    edgesByTarget.set(edge.targetId, targetEdges);
  }

  function getConnectedEdges(vertexId: VertexId): Edge[] {
    const outgoing = edgesBySource.get(vertexId) ?? [];
    const incoming = edgesByTarget.get(vertexId) ?? [];
    return [...outgoing, ...incoming];
  }

  return {
    connection,

    async fetchSchema() {
      const vertexTypeMap = new Map<string, VertexSchemaResponse>();
      for (const vertex of dataset.vertices) {
        const typeStr = vertex.type as string;
        const existing = vertexTypeMap.get(typeStr);
        const attrNames = new Set(existing?.attributes.map(a => a.name));
        const newAttrs = Object.entries(vertex.attributes)
          .filter(([name]) => !attrNames.has(name))
          .map(([name, value]) => ({
            name,
            dataType: inferDataType(value),
          }));
        vertexTypeMap.set(typeStr, {
          type: vertex.type,
          attributes: [...(existing?.attributes ?? []), ...newAttrs],
          total: (existing?.total ?? 0) + 1,
        });
      }

      const edgeTypeMap = new Map<string, EdgeSchemaResponse>();
      for (const edge of dataset.edges) {
        const typeStr = edge.type as string;
        const existing = edgeTypeMap.get(typeStr);
        const attrNames = new Set(existing?.attributes.map(a => a.name));
        const newAttrs = Object.entries(edge.attributes)
          .filter(([name]) => !attrNames.has(name))
          .map(([name, value]) => ({
            name,
            dataType: inferDataType(value),
          }));
        edgeTypeMap.set(typeStr, {
          type: edge.type,
          attributes: [...(existing?.attributes ?? []), ...newAttrs],
          total: (existing?.total ?? 0) + 1,
        });
      }

      // Derive edge connections
      const connectionPatterns = new Map<string, EdgeConnection>();
      for (const edge of dataset.edges) {
        const sourceVertex = vertexById.get(edge.sourceId);
        const targetVertex = vertexById.get(edge.targetId);
        if (!sourceVertex || !targetVertex) {
          continue;
        }
        const key = `${sourceVertex.type}-${edge.type}->${targetVertex.type}`;
        const existing = connectionPatterns.get(key);
        connectionPatterns.set(key, {
          edgeType: edge.type,
          sourceVertexType: sourceVertex.type,
          targetVertexType: targetVertex.type,
          count: (existing?.count ?? 0) + 1,
        });
      }

      return {
        totalVertices: dataset.vertices.length,
        vertices: [...vertexTypeMap.values()],
        totalEdges: dataset.edges.length,
        edges: [...edgeTypeMap.values()],
        edgeConnections: [...connectionPatterns.values()],
      } satisfies SchemaResponse;
    },

    async fetchVertexCountsByType(req) {
      const count = dataset.vertices.filter(
        v => (v.type as string) === req.label,
      ).length;
      return { total: count } satisfies CountsByTypeResponse;
    },

    async fetchNeighbors(req) {
      const connectedEdges = getConnectedEdges(req.vertexId);
      const excludedSet = req.excludedVertices ?? new Set<VertexId>();
      const filterTypes = req.filterByVertexTypes
        ? new Set(req.filterByVertexTypes)
        : null;

      const resultEdges: Edge[] = [];
      const resultVertexIds = new Set<VertexId>();

      for (const edge of connectedEdges) {
        const neighborId =
          edge.sourceId === req.vertexId ? edge.targetId : edge.sourceId;
        if (excludedSet.has(neighborId)) {
          continue;
        }
        const neighbor = vertexById.get(neighborId);
        if (!neighbor) {
          continue;
        }
        if (filterTypes && !filterTypes.has(neighbor.type as string)) {
          continue;
        }
        if (req.limit && req.limit > 0 && resultVertexIds.size >= req.limit) {
          break;
        }
        resultVertexIds.add(neighborId);
        resultEdges.push(edge);
      }

      const resultVertices = [...resultVertexIds]
        .map(id => vertexById.get(id))
        .filter((v): v is Vertex => v != null);

      return { vertices: resultVertices, edges: resultEdges };
    },

    async neighborCounts(req) {
      const counts = req.vertexIds.map(vertexId => {
        const connectedEdges = getConnectedEdges(vertexId);
        const neighborTypes = new Map<VertexType, number>();
        let totalCount = 0;

        for (const edge of connectedEdges) {
          const neighborId =
            edge.sourceId === vertexId ? edge.targetId : edge.sourceId;
          const neighbor = vertexById.get(neighborId);
          if (!neighbor) {
            continue;
          }
          totalCount++;
          neighborTypes.set(
            neighbor.type,
            (neighborTypes.get(neighbor.type) ?? 0) + 1,
          );
        }

        return { vertexId, totalCount, counts: neighborTypes };
      });

      return { counts };
    },

    async keywordSearch(req) {
      const searchTerm = req.searchTerm?.toLowerCase() ?? "";
      const filterTypes = req.vertexTypes ? new Set(req.vertexTypes) : null;
      const filterAttrs = req.searchByAttributes
        ? new Set(req.searchByAttributes)
        : null;
      const limit = req.limit ?? 10;
      const offset = req.offset ?? 0;

      const matched = dataset.vertices.filter(vertex => {
        if (filterTypes && !filterTypes.has(vertex.type as string)) {
          return false;
        }
        if (!searchTerm) {
          return true;
        }
        return Object.entries(vertex.attributes).some(([name, value]) => {
          if (filterAttrs && !filterAttrs.has(name)) {
            return false;
          }
          const strValue = String(value).toLowerCase();
          return req.exactMatch
            ? strValue === searchTerm
            : strValue.includes(searchTerm);
        });
      });

      return { vertices: matched.slice(offset, offset + limit) };
    },

    async vertexDetails(req) {
      const vertices = req.vertexIds
        .map(id => vertexById.get(id))
        .filter((v): v is Vertex => v != null);
      return { vertices };
    },

    async edgeDetails(req) {
      const edgeById = new Map(dataset.edges.map(e => [e.id, e]));
      const edges = req.edgeIds
        .map(id => edgeById.get(id))
        .filter((e): e is Edge => e != null);
      return { edges };
    },

    async rawQuery() {
      throw new Error(
        "Raw queries are not supported for local data connections",
      );
    },

    async fetchEdgeConnections(req) {
      const requestedTypes = new Set(req.edgeTypes.map(t => t as string));
      const patterns = new Map<string, EdgeConnection>();

      for (const edge of dataset.edges) {
        if (!requestedTypes.has(edge.type as string)) {
          continue;
        }
        const sourceVertex = vertexById.get(edge.sourceId);
        const targetVertex = vertexById.get(edge.targetId);
        if (!sourceVertex || !targetVertex) {
          continue;
        }
        const key = `${sourceVertex.type}-${edge.type}->${targetVertex.type}`;
        const existing = patterns.get(key);
        patterns.set(key, {
          edgeType: edge.type,
          sourceVertexType: sourceVertex.type,
          targetVertexType: targetVertex.type,
          count: (existing?.count ?? 0) + 1,
        });
      }

      return { edgeConnections: [...patterns.values()] };
    },
  } satisfies Explorer;
}

function inferDataType(value: unknown): string {
  if (typeof value === "number") {
    return "Number";
  }
  if (typeof value === "boolean") {
    return "Boolean";
  }
  return "String";
}
