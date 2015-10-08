import webpack from 'webpack';
import path from 'path';
import NyanProgressPlugin from 'nyan-progress-webpack-plugin';

import constants from './constants';


const devtools = process.env.CONTINUOUS_INTEGRATION ? 'inline-source-map'
               : 'cheap-module-eval-source-map';

export default function makeConfig(isDevelopment) {
  const config = {
    cache: isDevelopment,
    debug: isDevelopment,
    devtool: isDevelopment ? devtools : '',
    entry: {
      app: path.join(constants.SRC_DIR, 'index.js'),
    },
    module: {
      loaders: [{
        exclude: /node_modules/,
        loaders: ['babel'],
        test: /\.js$/,
      }],
    },
    output: {
      path: constants.BUILD_DIR,
      filename: '[name].js',
      chunkFilename: '[name]-[chunkhash].js',
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(isDevelopment ? 'development' : 'production'),
        },
      }),
      new webpack.optimize.OccurenceOrderPlugin(),
    ]
    .concat(
      !isDevelopment ? [
        new NyanProgressPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            screw_ie8: true, // eslint-disable-line camelcase
            warnings: false, // Because uglify reports irrelevant warnings.
          },
        }),
      ] : []
    ),
    resolve: {
      extensions: ['', '.js', '.json'],
      modulesDirectories: ['src', 'node_modules'],
      root: constants.ABSOLUTE_BASE,
    },
  };

  return config;
}
