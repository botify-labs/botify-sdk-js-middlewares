'use strict';

module.exports = {
  module: {
    loaders: [{
      exclude: /node_modules/,
      loaders: ['babel'],
      test: /\.js$/,
    }],
  },
  output: {
    library: 'BotifySDKMiddlewares',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: ['src', 'node_modules'],
  },
};
