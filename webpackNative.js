const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {resolve} = require('path');
const {DefinePlugin} = require('webpack');

const APP_DIR = __dirname;

module.exports = {
    entry: {
        native: './frontEnd/_nativeRenderApp/nativeRenderApp.ts'
    },
    output: {
        path: resolve(APP_DIR, 'dist/native'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/native/',
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new DefinePlugin({
            APPLICATION_NAME: '"CDE Form Embed"',
        }),
    ]
};
