const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        native: './modules/_nativeRenderApp/nativeRenderApp.ts'
    },
    output: {
        path: path.resolve(__dirname, '../../dist/native'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/native/',
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(['dist/native'], {root: process.cwd()}),
    ]
};
