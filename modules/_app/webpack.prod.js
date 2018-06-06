const merge = require('webpack-merge');
const baseConfig = require('../../webpack.prod.js');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const AotPlugin = require('@ngtools/webpack');

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
        new CleanWebpackPlugin(['dist/app']),
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../../tsconfig.json'),
            entryModule: path.resolve(__dirname, './app.module') + '#CdeAppModule'
        }),
    ]
});
