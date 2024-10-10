import * as pack from "../../package.json" with { type: "json" };

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "./dist", // Changes the build output directory to `./dist/`.
  env: {
    version: pack.version,
  },
};

export default nextConfig;
