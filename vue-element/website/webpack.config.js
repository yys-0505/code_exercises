const { VueLoaderPlugin } = require("vue-loader")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'main.ts'),
  output: {
    path: path.resolve(__dirname, '../website-dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
  },
  module: {
    rules: [{
      test: /\.vue$/,
      use: 'vue-loader'
    }, {
      test: /\.(ts|js)x?$/,
      exclude: /node_modules/,
      // loader: 'babel-loader'
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: "defaults" }]
          ]
        }
      }
    }, {
      test: /\.(svg|otf|ttf|woff|eot|gif|png)$/,
      loader: 'url-loader'
    }, {
      test: /\.(scss|css)$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    }]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'template.html')
    })
  ]
}