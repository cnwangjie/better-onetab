/* eslint-disable */
const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        parallel: true,
        cache: true,
        uglifyOptions: {
          compress: {
            drop_debugger: false,
            inline: false,
          },
        },
      }),
    ],
  },
})
