import {
  createEdge,
  createEdgeType,
  createVertex,
  createVertexId,
  createVertexType,
} from "@/core";

import {
  createLocalDataExplorer,
  type LocalDataset,
} from "./localDataExplorer";

function createTestDataset(): LocalDataset {
  return {
    vertices: [
      createVertex({
        id: "v1",
        types: ["Person"],
        attributes: { name: "Alice", age: 30 },
      }),
      createVertex({
        id: "v2",
        types: ["Person"],
        attributes: { name: "Bob", age: 25 },
      }),
      createVertex({
        id: "v3",
        types: ["Company"],
        attributes: { name: "Acme", founded: 2000 },
      }),
    ],
    edges: [
      createEdge({
        id: "e1",
        type: "knows",
        sourceId: "v1",
        targetId: "v2",
        attributes: { since: 2020 },
      }),
      createEdge({
        id: "e2",
        type: "worksAt",
        sourceId: "v1",
        targetId: "v3",
      }),
      createEdge({
        id: "e3",
        type: "worksAt",
        sourceId: "v2",
        targetId: "v3",
      }),
    ],
  };
}

const testConnection = {
  url: "",
  graphDbUrl: "",
  queryEngine: "localData" as const,
  proxyConnection: false,
  awsAuthEnabled: false,
};

describe("createLocalDataExplorer", () => {
  describe("fetchSchema", () => {
    it("should infer vertex types and attributes", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const schema = await explorer.fetchSchema();

      expect(schema.totalVertices).toBe(3);
      expect(schema.totalEdges).toBe(3);
      expect(schema.vertices).toHaveLength(2);
      expect(schema.edges).toHaveLength(2);

      const personType = schema.vertices.find(
        v => v.type === createVertexType("Person"),
      );
      expect(personType?.total).toBe(2);
      expect(personType?.attributes.map(a => a.name)).toContain("name");
      expect(personType?.attributes.map(a => a.name)).toContain("age");
    });

    it("should derive edge connections", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const schema = await explorer.fetchSchema();

      expect(schema.edgeConnections).toBeDefined();
      expect(schema.edgeConnections!.length).toBeGreaterThan(0);

      const worksAtConn = schema.edgeConnections!.find(
        c => c.edgeType === createEdgeType("worksAt"),
      );
      expect(worksAtConn).toBeDefined();
      expect(worksAtConn!.sourceVertexType).toBe(createVertexType("Person"));
      expect(worksAtConn!.targetVertexType).toBe(createVertexType("Company"));
      expect(worksAtConn!.count).toBe(2);
    });
  });

  describe("fetchVertexCountsByType", () => {
    it("should return correct count for a vertex type", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.fetchVertexCountsByType({
        label: "Person",
      });
      expect(result.total).toBe(2);
    });

    it("should return 0 for unknown type", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.fetchVertexCountsByType({
        label: "Unknown",
      });
      expect(result.total).toBe(0);
    });
  });

  describe("keywordSearch", () => {
    it("should return all vertices when no search term and empty vertex types", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.keywordSearch({
        vertexTypes: [],
        limit: 10,
      });
      expect(result.vertices).toHaveLength(3);
    });

    it("should find vertices by attribute value", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.keywordSearch({ searchTerm: "Alice" });
      expect(result.vertices).toHaveLength(1);
      expect(result.vertices[0].id).toBe(createVertexId("v1"));
    });

    it("should be case insensitive", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.keywordSearch({ searchTerm: "alice" });
      expect(result.vertices).toHaveLength(1);
    });

    it("should filter by vertex type", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.keywordSearch({
        searchTerm: "Acme",
        vertexTypes: ["Person"],
      });
      expect(result.vertices).toHaveLength(0);
    });

    it("should respect limit and offset", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.keywordSearch({
        limit: 1,
        offset: 0,
      });
      expect(result.vertices).toHaveLength(1);
    });

    it("should support exact match", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.keywordSearch({
        searchTerm: "ali",
        exactMatch: true,
      });
      expect(result.vertices).toHaveLength(0);
    });
  });

  describe("fetchNeighbors", () => {
    it("should return neighbors of a vertex", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.fetchNeighbors({
        vertexId: createVertexId("v1"),
      });
      expect(result.vertices).toHaveLength(2);
      expect(result.edges).toHaveLength(2);
    });

    it("should exclude specified vertices", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.fetchNeighbors({
        vertexId: createVertexId("v1"),
        excludedVertices: new Set([createVertexId("v2")]),
      });
      expect(result.vertices).toHaveLength(1);
      expect(result.vertices[0].id).toBe(createVertexId("v3"));
    });

    it("should filter by vertex type", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.fetchNeighbors({
        vertexId: createVertexId("v1"),
        filterByVertexTypes: ["Company"],
      });
      expect(result.vertices).toHaveLength(1);
      expect(result.vertices[0].id).toBe(createVertexId("v3"));
    });

    it("should respect limit", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.fetchNeighbors({
        vertexId: createVertexId("v1"),
        limit: 1,
      });
      expect(result.vertices).toHaveLength(1);
    });
  });

  describe("neighborCounts", () => {
    it("should return correct counts", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.neighborCounts({
        vertexIds: [createVertexId("v1")],
      });
      expect(result.counts).toHaveLength(1);
      expect(result.counts[0].totalCount).toBe(2);
      expect(result.counts[0].counts.get(createVertexType("Person"))).toBe(1);
      expect(result.counts[0].counts.get(createVertexType("Company"))).toBe(1);
    });
  });

  describe("vertexDetails", () => {
    it("should return vertex by ID", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.vertexDetails({
        vertexIds: [createVertexId("v1")],
      });
      expect(result.vertices).toHaveLength(1);
      expect(result.vertices[0].attributes.name).toBe("Alice");
    });

    it("should skip unknown IDs", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.vertexDetails({
        vertexIds: [createVertexId("v999")],
      });
      expect(result.vertices).toHaveLength(0);
    });
  });

  describe("edgeDetails", () => {
    it("should return edge by ID", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.edgeDetails({
        edgeIds: [
          createEdge({
            id: "e1",
            type: "knows",
            sourceId: "v1",
            targetId: "v2",
          }).id,
        ],
      });
      expect(result.edges).toHaveLength(1);
    });
  });

  describe("rawQuery", () => {
    it("should throw not supported error", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      await expect(
        explorer.rawQuery({ query: "SELECT * FROM ..." }),
      ).rejects.toThrow("not supported");
    });
  });

  describe("fetchEdgeConnections", () => {
    it("should return connections for requested edge types", async () => {
      const explorer = createLocalDataExplorer(
        testConnection,
        createTestDataset(),
      );
      const result = await explorer.fetchEdgeConnections({
        edgeTypes: [createEdgeType("worksAt")],
      });
      expect(result.edgeConnections).toHaveLength(1);
      expect(result.edgeConnections[0].count).toBe(2);
    });
  });
});
