const merge = require('webpack-merge');
const baseConfig = require('../../webpack.dev.js');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(baseConfig, {
    entry: {
        native: './modules/_nativeRenderApp/nativeRenderApp.ts'
    },
    output: {
        path: path.resolve(__dirname, '../../dist/native'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/native/',
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'ts-loader', options: {configFile: '../../tsconfigNative.json'}},
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist/native'], {root: process.cwd()})
    ]
});
