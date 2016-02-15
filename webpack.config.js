module.exports = {
  entry: "./js/index.js",
  output: {
    path: __dirname + "/assets",
    publicPath: "/assets",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: "babel",
        query: {
          presets:["es2015", "react"]
        },
        exclude: /node_modules/
      }
    ]
  }
}
