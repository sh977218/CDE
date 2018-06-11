const baseConfig = require('../../webpack.prod.js');
const merge = require('webpack-merge');
const path = require('path');
const AotPlugin = require('@ngtools/webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(baseConfig, {
    entry: {
        cde: './modules/_app/main.ts'
    },
    output: {
        path: path.resolve(__dirname, '../../dist/app'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/app/',
        filename: '[name].js',
    },
    plugins: [
        new CleanWebpackPlugin(['dist/app']),
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../../tsconfig.json'),
            entryModule: path.resolve(__dirname, './app.module') + '#CdeAppModule'
        }),
    ],
});
