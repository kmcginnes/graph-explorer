import { vol } from "memfs";
import { beforeEach, afterEach, vi } from "vitest";

// Mock the 'fs' module
// eslint-disable-next-line @typescript-eslint/no-require-imports
vi.mock("fs", () => require("memfs").fs);

// Mock the 'fs/promises' module
// eslint-disable-next-line @typescript-eslint/no-require-imports
vi.mock("fs/promises", () => require("memfs").fs.promises);

// Mock the common paths to eliminate relative paths
vi.mock("./paths.js", () => ({
  repoRoot: "/repo",
  clientRoot: "/repo/packages/client",
  proxyServerRoot: "/repo/packages/server",
}));

beforeEach(() => {
  // Reset the volume before each test
  vol.reset();

  // Ensure the common paths exist
  vol.mkdirSync("/repo/packages/client", { recursive: true });
  vol.mkdirSync("/repo/packages/server", { recursive: true });
});

afterEach(() => {
  // Clean up if needed after each test
});
