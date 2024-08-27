function extractServerUrl(env: Record<string, string>) {
  const host = env.HOST ?? "localhost";
  return `http://${host}`;
}

describe("extractServerUrl", () => {
  it("should return defaults", () => {
    const result = extractServerUrl({});
    expect(result).toEqual("http://localhost");
  });
});
