import { sampleDataPayload } from "./sampleData";
import { validateAndTransform } from "./validateAndTransform";

describe("sampleDataPayload", () => {
  it("should pass validation with no skipped records", () => {
    const result = validateAndTransform(sampleDataPayload);
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.skipped).toHaveLength(0);
    expect(result.vertices.length).toBe(
      sampleDataPayload.data.graph.vertices.length,
    );
    expect(result.edges.length).toBe(sampleDataPayload.data.graph.edges.length);
  });
});
