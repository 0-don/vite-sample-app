import { copyFileSync } from "fs";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    nodePolyfills({ include: ["http", "https", "fs"] }),
    {
      name: "copy-files",
      writeBundle: () =>
        [
          {
            src: "node_modules/monero-ts/dist/monero_wallet_keys.wasm",
            dest: "dist/monero_wallet_keys.wasm",
          },
          {
            src: "node_modules/monero-ts/dist/monero_web_worker.js",
            dest: "dist/monero_web_worker.js",
          },
        ].forEach(({ src, dest }) => copyFileSync(src, dest)),
    },
    {
      name: "replace",
      transform: (src) =>
        src.includes("require.cache")
          ? src.replaceAll("require.cache", "null")
          : src,
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    commonjsOptions: { transformMixedEsModules: true },
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        format: "es",
      },
    },
  },
});
