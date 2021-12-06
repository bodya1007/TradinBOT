'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');
const webpack = require('webpack');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    popup: PATHS.src + '/popup.js',
    contentScript: PATHS.src + '/contentScript.js',
    background: PATHS.src + '/background.js',
  },
  resolve: {
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "fs": require.resolve("browserify-fs"),
      "constants": require.resolve("constants-browserify"),
      'buffer': require.resolve("buffer-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "net": require.resolve("net-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "http": require.resolve("stream-http")
    },
    alias: {
      process: "process/browser"
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
    }),
  ],

});

module.exports = config;
// resolve: {
//   fallback: {
//       "fs": false
//   },
// }