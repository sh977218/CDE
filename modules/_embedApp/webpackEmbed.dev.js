const merge = require('webpack-merge');
const baseConfig = require('../../webpack.dev.js');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(baseConfig, {
    entry: {
        embed: './modules/_embedApp/embeddedApp.ts'
    },
    output: {
        path: path.resolve(__dirname, '../../dist/embed'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/embed/',
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(['dist/embed'])
    ]
});
