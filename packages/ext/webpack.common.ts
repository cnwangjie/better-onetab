import type { Configuration } from 'webpack'
import path from 'path'
import { ProgressPlugin, DefinePlugin, ProvidePlugin } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import YamlLocalesWebpackPlugin from 'yaml-locales-webpack-plugin'

const resolve = (...paths: string[]) => path.join(__dirname, ...paths)

const mode: any = process.env.NODE_ENV || 'development'

/**
 * @type {import('webpack').Configuration}
 */
const config: Configuration = {
  entry: {
    app: './src/app/main.tsx',
    background: './src/background/index.ts',
  },
  mode,
  devtool: 'eval-source-map',
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
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/app/index.html',
      excludeChunks: ['background', 'content', 'exchanger'],
      inject: true,
    }),
    new YamlLocalesWebpackPlugin(),
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

export default config
