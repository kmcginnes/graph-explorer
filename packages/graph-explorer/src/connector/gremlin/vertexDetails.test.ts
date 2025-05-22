import {
  createGremlinResponseFromVertex,
  createRandomVertex,
} from "@/utils/testing";
import { vertexDetails } from "./vertexDetails";

describe("vertexDetails", () => {
  it("should return the correct vertex details", async () => {
    const vertex = createRandomVertex();
    const response = createGremlinResponseFromVertex(vertex);
    const mockFetch = vi
      .fn()
      .mockImplementation(() => Promise.resolve(response));

    const result = await vertexDetails(mockFetch, {
      vertexIds: [vertex.id],
    });

    expect(result.vertices).toEqual([vertex]);
  });

  it("should not be fragment if the response does not include the properties", async () => {
    const vertex = createRandomVertex();
    vertex.attributes = {};
    vertex.__isFragment = true;
    const response = createGremlinResponseFromVertex(vertex);
    const mockFetch = vi
      .fn()
      .mockImplementation(() => Promise.resolve(response));

    const result = await vertexDetails(mockFetch, {
      vertexIds: [vertex.id],
    });

    expect(result.vertices[0]?.__isFragment).toBe(false);
  });
});
