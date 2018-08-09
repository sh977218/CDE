const merge = require('webpack-merge');
const baseConfig = require('../../webpack.prod.js');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const AotPlugin = require('@ngtools/webpack');

module.exports = merge(baseConfig, {
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
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../../tsconfigEmbed.json'),
            entryModule: path.resolve(__dirname, './embedApp.module') + '#EmbedAppModule'
        }),
    ],
});
