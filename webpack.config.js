const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: {
    react_home: "./api/src/react_home.js",
    shoplist: "./api/src/shoplist.js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },
  output: {
    path: path.resolve(__dirname, "./api/static"),
    filename: "[name].bundle.js",
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};