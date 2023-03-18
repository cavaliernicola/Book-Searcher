const path = require("path");

module.exports = {
  mode: "production",

  entry: "/assets/js/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist")
  },

  watchOptions: {
    poll: true,
    ignored: /node_modules/,
  },

  devServer: {
    open: true,
    static: {
        directory: path.join(__dirname, '/')
    }
  },
}