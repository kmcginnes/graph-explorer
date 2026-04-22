import { createVertexId } from "@/core";

import { validateAndTransform } from "./validateAndTransform";

describe("validateAndTransform", () => {
  const validPayload = {
    meta: { version: "1" },
    data: {
      graph: {
        vertices: [
          { id: "v1", type: "Person", attributes: { name: "Alice" } },
          { id: "v2", type: "Person", attributes: { name: "Bob" } },
        ],
        edges: [
          {
            id: "e1",
            type: "knows",
            source: "v1",
            target: "v2",
            attributes: { since: 2020 },
          },
        ],
      },
    },
  };

  it("should accept a valid payload", () => {
    const result = validateAndTransform(validPayload);
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.vertices).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
  });

  it("should transform vertex attributes correctly", () => {
    const result = validateAndTransform(validPayload);
    if (!result.success) {
      return;
    }
    const alice = result.vertices.find(v => v.id === createVertexId("v1"));
    expect(alice?.attributes).toStrictEqual({ name: "Alice" });
    expect(alice?.type).toBe("Person");
  });

  it("should transform edge properties correctly", () => {
    const result = validateAndTransform(validPayload);
    if (!result.success) {
      return;
    }
    expect(result.edges[0].attributes).toStrictEqual({ since: 2020 });
    expect(result.edges[0].sourceId).toBe(createVertexId("v1"));
    expect(result.edges[0].targetId).toBe(createVertexId("v2"));
  });

  it("should reject payload missing meta.version", () => {
    const result = validateAndTransform({
      meta: {},
      data: { graph: { vertices: [], edges: [] } },
    });
    expect(result.success).toBe(false);
  });

  it("should reject payload missing data.graph", () => {
    const result = validateAndTransform({
      meta: { version: "1" },
      data: {},
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-object payload", () => {
    const result = validateAndTransform("not an object");
    expect(result.success).toBe(false);
  });

  it("should skip edges referencing nonexistent vertices", () => {
    const payload = {
      meta: { version: "1" },
      data: {
        graph: {
          vertices: [{ id: "v1", type: "Person" }],
          edges: [
            {
              id: "e1",
              type: "knows",
              source: "v1",
              target: "v999",
            },
          ],
        },
      },
    };
    const result = validateAndTransform(payload);
    if (!result.success) {
      return;
    }
    expect(result.edges).toHaveLength(0);
    expect(result.skipped).toStrictEqual([
      {
        entityType: "edge",
        id: "e1",
        reason: "References nonexistent vertex",
      },
    ]);
  });

  it("should handle vertices without attributes", () => {
    const payload = {
      meta: { version: "1" },
      data: {
        graph: {
          vertices: [{ id: "v1", type: "Person" }],
          edges: [],
        },
      },
    };
    const result = validateAndTransform(payload);
    if (!result.success) {
      return;
    }
    expect(result.vertices[0].attributes).toStrictEqual({});
  });

  it("should filter out non-scalar attribute values", () => {
    const payload = {
      meta: { version: "1" },
      data: {
        graph: {
          vertices: [
            {
              id: "v1",
              type: "Person",
              attributes: {
                name: "Alice",
                nested: { foo: "bar" },
                list: [1, 2, 3],
                valid: 42,
              },
            },
          ],
          edges: [],
        },
      },
    };
    const result = validateAndTransform(payload);
    if (!result.success) {
      return;
    }
    expect(result.vertices[0].attributes).toStrictEqual({
      name: "Alice",
      valid: 42,
    });
  });

  it("should handle numeric IDs", () => {
    const payload = {
      meta: { version: "1" },
      data: {
        graph: {
          vertices: [
            { id: 1, type: "Person" },
            { id: 2, type: "Person" },
          ],
          edges: [{ id: 100, type: "knows", source: 1, target: 2 }],
        },
      },
    };
    const result = validateAndTransform(payload);
    if (!result.success) {
      return;
    }
    expect(result.vertices).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
  });
});
