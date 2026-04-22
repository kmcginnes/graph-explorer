import { parsePostMessage, POST_MESSAGE_TYPE } from "./postMessage";

describe("parsePostMessage", () => {
  const validPayload = {
    meta: { version: "1", name: "Test Data" },
    data: {
      graph: {
        vertices: [{ id: "v1", type: "Person" }],
        edges: [],
      },
    },
  };

  it("should parse a valid postMessage", () => {
    const result = parsePostMessage({
      type: POST_MESSAGE_TYPE,
      payload: validPayload,
    });
    expect(result).not.toBeNull();
    expect(result!.payload.meta.name).toBe("Test Data");
  });

  it("should return null for non-matching type", () => {
    const result = parsePostMessage({
      type: "some-other-type",
      payload: validPayload,
    });
    expect(result).toBeNull();
  });

  it("should return null for invalid payload structure", () => {
    const result = parsePostMessage({
      type: POST_MESSAGE_TYPE,
      payload: { invalid: true },
    });
    expect(result).toBeNull();
  });

  it("should return null for non-object data", () => {
    expect(parsePostMessage("string")).toBeNull();
    expect(parsePostMessage(null)).toBeNull();
    expect(parsePostMessage(42)).toBeNull();
  });
});
