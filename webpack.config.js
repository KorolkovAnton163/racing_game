const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

const public = path.resolve(__dirname, 'public');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'index.js',
    path: public,
  },
  devServer: {
    static: public,
  },
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
      }),
      // new CopyPlugin({
      //   patterns: [
      //     { from: path.resolve('src/ammo'), to: path.resolve('dist') },
      //     { from: path.resolve('src/assets'), to: path.resolve('dist/assets') }
      //   ]
      // })
  ]
}
