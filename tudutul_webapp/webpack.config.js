const path = require("path");
const glob = require('glob');
const webpack = require("webpack");

module.exports = {
    entry: glob.sync('./src/js/**.js').reduce(function(obj, el){
        obj[path.parse(el).name] = el;
        return obj
     },{}),
  output: {
    path: path.resolve(__dirname, "./static/js"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  plugins: [
    
  ],
};