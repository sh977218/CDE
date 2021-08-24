const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {resolve} = require('path');
const {DefinePlugin} = require('webpack');

const APP_DIR = __dirname;

module.exports = {
    entry: {
        embed: './frontEnd/_embedApp/embeddedApp.ts'
    },
    output: {
        path: resolve(APP_DIR, 'dist/embed'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/embed/',
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new DefinePlugin({
            APPLICATION_NAME: '"CDE Search Embed"',
        }),
    ],
};
