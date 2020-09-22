const {HotModuleReplacementPlugin} = require('webpack');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpackApp.dev');

module.exports = merge(baseConfig, {
    plugins: [
        new HotModuleReplacementPlugin()
    ],
});
