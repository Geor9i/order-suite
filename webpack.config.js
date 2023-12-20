const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  devtool: 'eval-source-map', // or 'cheap-source-map'
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  watch: true,
  module: {
    rules: [
      // Add this rule for handling CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
};
