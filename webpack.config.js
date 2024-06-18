const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  devtool: 'eval-source-map', // or 'cheap-source-map'
  output: {
    filename: "[name].js",
    chunkFilename: "[id].[chunkhash].js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    port: 9000,
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
    watchFiles: ["*.html"],
    compress: true,
    open: true,
    hot: false, // Enable HMR
    historyApiFallback: {
      index: "/",
      disableDotRule: true,
    },
  },
  watch: true,
  module: {
    rules: [
      // Add this rule for handling CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  // Exclude source maps for specific modules
  optimization: {
    minimize: false, // Disable minimization for development
  },
  resolve: {
    alias: {
      // Add aliases for specific modules if needed
      firebase: path.resolve(__dirname, 'node_modules/firebase'),
      lit: path.resolve(__dirname, 'node_modules/lit'),
      // Add other aliases as needed
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: "index.html",
      chunks: ["main"],
    }),
  ],
};
