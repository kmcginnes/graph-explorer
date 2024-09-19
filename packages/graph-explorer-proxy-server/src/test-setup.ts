import { vol } from "memfs";
import { patchFs } from "fs-monkey";
import { beforeEach, afterEach } from "vitest";

// Patch all file system APIs to use the in memory file system
patchFs(vol);

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
