const path = require('path')
const { ProgressPlugin, DefinePlugin, ProvidePlugin } = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const resolve = (...paths) => path.join(__dirname, ...paths)

const mode = process.env.NODE_ENV || 'development'

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: {
    app: './src/app/main.tsx',
    background: './src/background/index.ts',
  },
  mode,
  devtool: 'eval-source-map',
  devServer: {
    static: resolve('dist'),
    port: 'auto',
  },
  output: {
    path: resolve('dist'),
    filename: '[name].js',
  },
  plugins: [
    new DefinePlugin({
      DEBUG: mode === 'development',
      PRODUCTION: mode !== 'development',
    }),
    new ProvidePlugin({
      process: 'process/browser',
    }),
    new CleanWebpackPlugin(),
    new ProgressPlugin({}),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest.json',
        },
        { from: 'src/assets/icons', to: 'assets/icons' },
        { from: 'src/_locales', to: '_locales' },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/app/index.html',
      excludeChunks: ['background', 'content', 'exchanger'],
      inject: true,
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      src: resolve('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'es2015',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
}
