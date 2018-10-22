const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        embed: './modules/_embedApp/embeddedApp.ts'
    },
    output: {
        path: path.resolve(__dirname, '../../dist/embed'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/embed/',
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(['dist/embed'], {root: process.cwd()}),
        new webpack.DefinePlugin({
            APPLICATION_NAME: '"CDE Search Embed"',
        }),
    ],
};
