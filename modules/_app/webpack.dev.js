const merge = require('webpack-merge');
const baseConfig = require('../../webpack.dev.js');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(baseConfig, {
    entry: {
        cde: './modules/_app/main.ts'
    },
    output: {
        path: path.resolve(__dirname, '../../dist/app'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/app/',
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(['dist/app'])
    ]
});
