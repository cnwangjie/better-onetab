/* eslint-disable */
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const path = require('path')

const config = {
  development: {
    __CLIENT_ID__: '530831729511-eq8apt6dhjimbmdli90jp2ple0lfmn3l.apps.googleusercontent.com',
    __DEV_CSP__: process.env.MOZ ? '' : ' http://localhost:8098 chrome-extension://nhdogjmejiglipccpnnnanhbledajbpd',
    __EXT_NAME__: 'better-onetab (dev)',
    __CONTENT_SCRIPTS_MATCHES__: process.env.MOZ ? '*://*/*' : 'http://127.0.0.1:3000/*',
  },
  production: {
    __CLIENT_ID__: '530831729511-dclgvblhv7var13mvpjochb5f295a6vc.apps.googleusercontent.com',
    __DEV_CSP__: '',
    __EXT_NAME__: '__MSG_ext_name__',
    __CONTENT_SCRIPTS_MATCHES__: 'https://boss.cnwangjie.com/*',
  }
}

const resolve = (...paths) => path.join(__dirname, ...paths)
const mode = process.env.NODE_ENV || 'development'
const moz = process.env.MOZ
module.exports = {
  entry: {
    app: ['./src/app/index.js'],
    background: ['./src/background/index.js'],
    content: './src/content.js',
    exchanger: './src/exchanger.js',
  },
  output: {
    path: resolve('dist'),
    filename : '[name].js',
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
    new webpack.DefinePlugin({
      DEBUG: mode === 'development',
      PRODUCTION: mode !== 'development',
      MOZ: moz,
    }),
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([
      {
        from: 'src/manifest.json',
        to: 'manifest.json',
        transform(content, path) {
          content = content.toString()
          if (mode in config) {
            Object.entries(config[mode]).map(([key, value]) => {
              content = content.replace(new RegExp(key, 'g'), value)
            })
          }
          return content
        }
      },
      { from: 'src/assets/icons', to: 'assets/icons' },
      { from: 'src/_locales', to: '_locales' },
    ]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/app/index.html',
      excludeChunks: ['background', 'content', 'exchanger'],
      inject: true,
    }),
    new VueLoaderPlugin(),
    new VuetifyLoaderPlugin(),
  ],
  performance: {
    hints: false,
  },
  optimization: {
    splitChunks: {
      name: true,
      minChunks: Infinity,
    },
    minimizer: [],
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
        test: /\.styl/,
        use: [
          'vue-style-loader',
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          useRelativePath: true,
        },
      },
      {
        test: /\.png$/,
        use: 'url-loader?mimetype=image/png'
      },
      {
        test: /\.md$/,
        use: [
          { loader: "html-loader" },
          { loader: "markdown-loader" },
        ]
      },
    ]
  }
}

