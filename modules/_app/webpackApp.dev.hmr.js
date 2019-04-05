const webpack = require('webpack');
const baseConfig = require('./webpackApp.dev');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, {
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
});
