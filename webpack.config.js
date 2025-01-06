const path = require("path")

module.exports = {
  mode: 'production',
  module: {
    rules: [
      {
          test: /\.tsx?$/, // Rule for TypeScript files
          use: 'ts-loader',
          exclude: /node_modules/,
      },
      {
          test: /\.svg$/i, // Rule for SVG files
          type: 'asset/resource', // Outputs SVGs as separate files
          generator: {
              filename: 'images/design/[name][ext]', // Specify output folder
          },
      },
      {
          test: /\.(png|jpe?g|gif|webp|bmp)$/i, // Rule for image files
          type: 'asset/resource',
          generator: {
              filename: 'images/design/[name][ext]',
          },
      },
    ],
  },
  entry : "./src/js/app.ts",
  output : {
    path: path.resolve(__dirname, "dist/js"),
    filename: "app.js"
  },
  optimization: {
    minimize: true
  },
  devServer: {
    static: {
      directory: path.join(__dirname, ''),
    },
  },
  resolve: {
    extensions: ['.ts', '.js'],
  }
}