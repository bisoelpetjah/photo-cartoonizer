const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')
const NodemonPlugin = require('nodemon-webpack-plugin')

module.exports = {
  mode: 'development',
  node: {
    fs: 'empty',
  },
  stats: {
    assets: true,
    children: false,
    colors: true,
    depth: false,
    entrypoints: false,
    moduleAssets: true,
  },
  entry: {
    app: path.resolve(__dirname, 'src', 'client'),
  },
  output: {
    publicPath: '/dist/',
    filename: '[name].[contenthash].js',
    chunkFilename: 'chunk.[name].[contenthash].js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },{
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: {
                localIdentName: '[local]-[hash:8]',
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              ident: 'postcss-ident',
              plugins: [
                require('postcss-import')({
                  path: ['src'],
                }),
                require('postcss-preset-env')({
                  stage: 0,
                  browsers: 'defaults',
                  importFrom: path.resolve(__dirname, 'src/app/base.css'),
                  features: {
                    'custom-media-queries': {
                      preserve: false,
                    },
                  },
                }),
              ],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      assets: path.resolve(__dirname, 'assets'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: 'chunk.[name].[contenthash].css',
    }),
    new LoadablePlugin({
      filename: 'manifest.json',
      writeToDisk: {
        filename: __dirname,
      },
    }),
    new NodemonPlugin({
      script: '.',
      exec: 'babel-node',
      env: {
        BABEL_ENV: 'server',
        PORT: process.env.PORT + 1,
      },
      ext: 'js,jsx,marko,css,json',
      watch: ['./src', './manifest.json'],
      ignore: ['*.marko.js'],
    }),
  ],
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    inline: false,
    hot: false,
    host: 'localhost',
    port: process.env.PORT,
    proxy: {
      '**': {
        target: 'http://localhost:' + process.env.PORT + 1,
        changeOrigin: true,
      },
    },
    before: app => {
      app.get('/dist/service-worker.js', (req, res, next) => {
        res.set('service-worker-allowed', '/')
        return next()
      })
    },
    disableHostCheck: true,
  },
}
