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
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'ts-loader', options: {configFile: '../../tsconfigEmbed.json'}},
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist/embed'], {root: path.resolve(__dirname, '../..')})
    ]
});
