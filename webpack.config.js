const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

const resolve = (...paths) => path.join(__dirname, ...paths)
const mode = process.env.NODE_ENV || 'development'
module.exports = {
  mode,
  entry: {
    index: ['./src/index.js'],
    background: './src/background.js',
  },
  output: {
    path: resolve('dist'),
    filename : '[name].js',
  },
  plugins: [
    new webpack.DefinePlugin({
      DEBUG: mode === 'development',
      PRODUCTION: mode !== 'development',
    }),
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([
      'src/manifest.json',
      { from: 'src/assets/icons', to: 'assets/icons' },
      { from: 'src/_locales', to: '_locales' },
    ]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      excludeChunks: ['background'],
      inject: true,
    }),
    new VueLoaderPlugin(),
    new UglifyJsPlugin({
      uglifyOptions: {
        parallel: 4,
        compress: {
          drop_console: true,
        }
      }
    }),
  ],
  optimization: {
    splitChunks: {
      name: true,
      minChunks: Infinity,
    },
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')],
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          useRelativePath: true,
        },
      },
    ]
  }
}