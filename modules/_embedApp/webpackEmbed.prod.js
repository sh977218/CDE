const baseConfig = require('../../webpack.prod');
const embedConfig = require('./webpackEmbed');
const merge = require('webpack-merge');
const path = require('path');
const AotPlugin = require('@ngtools/webpack');

module.exports = merge(baseConfig, embedConfig, {
    plugins: [
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../../tsconfigEmbed.json'),
            entryModule: path.resolve(__dirname, './embedApp.module') + '#EmbedAppModule'
        }),
    ],
});
