/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv, PluginOption } from "vite";
import { coverageConfigDefaults, defineConfig } from "vitest/config";
import {
  extractClientUrl,
  extractServerUrl,
  EnvironmentValuesSchema,
} from "@graph-explorer/shared/env";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const parsedEnv = EnvironmentValuesSchema.parse(env);
  const serverUrl = extractServerUrl(parsedEnv);
  const clientUrl = extractClientUrl(parsedEnv);

  const htmlPlugin = (): PluginOption => {
    return {
      name: "html-transform",
      transformIndexHtml: {
        order: "pre",
        handler: (html: string) => {
          return html.replace(/%(.*?)%/g, function (_match, p1) {
            return env[p1] ? env[p1] : "";
          });
        },
      },
    };
  };

  return {
    server: {
      host: true,
      origin: serverUrl,
    },
    base: clientUrl,
    envPrefix: "GRAPH_EXP",
    define: {
      __GRAPH_EXP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __API_URL__: JSON.stringify(serverUrl),
    },
    plugins: [tsconfigPaths(), htmlPlugin(), react()],
    test: {
      environment: "happy-dom",
      globals: true,
      setupFiles: ["src/setupTests.ts"],
      coverage: {
        reportsDirectory: "coverage",
        provider: "v8",
        reporter: ["lcov", "text", "json", "clover"],
        exclude: [
          "src/components/icons",
          "src/@types",
          "src/index.tsx",
          "src/App.ts",
          "src/setupTests.ts",
          "src/**/*.style.ts",
          "src/**/*.styles.ts",
          "src/**/*.styles.css.ts",
          "tailwind.config.ts",
          ...coverageConfigDefaults.exclude,
        ],
      },
    },
  };
});
