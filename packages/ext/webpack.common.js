const path = require('path')
const { ProgressPlugin } = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const resolve = (...paths) => path.join(__dirname, ...paths)

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: {
    app: './src/app/main.tsx'
  },
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: resolve('dist'),
    port: 'auto',
  },
  output: {
    path: resolve('dist'),
    filename: '[name].js'
  },
  plugins: [
    new ProgressPlugin({
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest.json'
        },
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/app/index.html',
      excludeChunks: ['background', 'content', 'exchanger'],
      inject: true
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      src: resolve('src'),
    }
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'es2015'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      }
    ]
  }
}
