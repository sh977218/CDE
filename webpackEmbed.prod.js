const {AngularCompilerPlugin} = require('@ngtools/webpack');
const {resolve} = require('path');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.prod');
const embedConfig = require('./webpackEmbed');

module.exports = merge(baseConfig, embedConfig, {
    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: resolve(__dirname, './tsconfigEmbed.json'),
            entryModule: resolve(__dirname, './frontEnd/_embedApp/embedApp.module') + '#EmbedAppModule'
        }),
    ],
});
