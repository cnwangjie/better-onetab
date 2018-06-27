const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const path = require('path')
const fs = require('fs')

let definePluginObj = {
  '__i18n__': JSON.stringify(fs.readFileSync('src/_locales/zh_CN/messages.json').toString())
}

module.exports = {
  entry: './src/popup.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map',
  plugins: [
    new webpack.DefinePlugin(definePluginObj)
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new UglifyJSPlugin({
      sourceMap: true
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src/_locales'),
        to: path.resolve(__dirname, 'dist/_locales'),
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, 'src/manifest.json'),
        to: path.resolve(__dirname, 'dist/manifest.json'),
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, 'src/assets'),
        to: path.resolve(__dirname, 'dist/assets'),
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, 'popup.html'),
        to: path.resolve(__dirname, 'dist/popup.html'),
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, 'option.html'),
        to: path.resolve(__dirname, 'dist/option.html'),
        ignore: ['.*']
      }
    ])
  ])
}
