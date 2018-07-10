const merge = require('webpack-merge');
const baseConfig = require('../../webpack.prod.js');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const AotPlugin = require('@ngtools/webpack');

module.exports = merge(baseConfig, {
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
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../../tsconfigNative.json'),
            entryModule: path.resolve(__dirname, './nativeRenderApp.module') + '#NativeRenderAppModule'
        }),
    ]
});
