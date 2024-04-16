import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import copy from "rollup-plugin-copy";
import nodePolyfills from "rollup-plugin-polyfill-node";

const config: RollupOptions = {
  input: "./src/index.ts",
  output: {
    dir: "dist",
    format: "umd",
    name: "monero",
  },
  plugins: [
    typescript(),
    json(),

    nodePolyfills(),
    nodeResolve(),
    commonjs({
      transformMixedEsModules: true,
    }),
    copy({
      targets: [
        { src: "node_modules/monero-ts/dist/*.wasm", dest: "dist/" },
        {
          src: "node_modules/monero-ts/dist/monero_web_worker.js",
          dest: "dist/",
        },
        { src: "src/index.html", dest: "dist/" },
        { src: "src/server.py", dest: "dist/" },
      ],
    }),
    replace({
      this: "window",
      preventAssignment: true,
      'Object.defineProperty(exports,"__esModule",{value:!0})': "",
      delimiters: ["\n", "\n"],
    }),
  ],
};

export default config;
