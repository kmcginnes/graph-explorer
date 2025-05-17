/// <reference types="vitest" />

import { reactRouter } from "@react-router/dev/vite";
import babel from "vite-plugin-babel";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv, PluginOption } from "vite";
import { coverageConfigDefaults, defineConfig } from "vitest/config";
import { PluginOptions } from "babel-plugin-react-compiler";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

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
      watch: {
        ignored: ["**/*.test.ts", "**/*.test.tsx"],
      },
    },
    envPrefix: "GRAPH_EXP",
    define: {
      __GRAPH_EXP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    plugins: [
      tsconfigPaths(),
      htmlPlugin(),
      reactRouter(),
      babel({
        filter: /\.[jt]sx?$/,
        babelConfig: {
          presets: ["@babel/preset-typescript"],
          plugins: [
            ["babel-plugin-react-compiler", ReactCompilerConfig],
            ["@babel/plugin-syntax-jsx", {}],
          ],
        },
      }),
    ],
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

const ReactCompilerConfig: Partial<PluginOptions> = {
  target: "19",
};
