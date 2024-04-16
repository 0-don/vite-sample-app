const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

let configBase = {
  name: "Offline wallet generator",
  entry: "./src/index.ts",
  output: {
    path: path.join(path.resolve(), "dist"),
    filename: "monero.js",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  externals: ["child_process"],
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            "node_modules",
            "monero-ts",
            "dist",
            "monero_wallet_keys.wasm"
          ),
          to: path.resolve(__dirname, "dist", "monero_wallet_keys.wasm"),
        },
        {
          from: path.resolve(
            __dirname,
            "node_modules",
            "monero-ts",
            "dist",
            "monero_web_worker.js"
          ),
          to: path.resolve(__dirname, "dist", "monero_web_worker.js"),
        },
        {
          from: path.resolve(__dirname, "src", "index.html"),
          to: path.resolve(__dirname, "dist", "index.html"),
        },
        {
          from: path.resolve(__dirname, "src", "server.py"),
          to: path.resolve(__dirname, "dist", "server.py"),
        },
      ],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  resolve: {
    alias: {
      fs: "html5-fs",
    },
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify/browser"),
      path: require.resolve("path-browserify"),
      querystring: require.resolve("querystring-es3"),
      stream: require.resolve("stream-browserify"),
      zlib: require.resolve("browserify-zlib"),
    },
  },
};

module.exports = configBase;
