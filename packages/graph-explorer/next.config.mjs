/** @type {import('next').NextConfig} */
import * as pack from "../../package.json" with { type: "json" };

const nextConfig = {
  output: "export", // Outputs a Single-Page Application (SPA).
  distDir: "./dist", // Changes the build output directory to `./dist/`.
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH, // Sets the base path to `/some-base-path`.
  env: {
    version: pack.version,
  },
};

export default nextConfig;
