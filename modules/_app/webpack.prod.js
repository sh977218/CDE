const baseConfig = require('../../webpack.prod');
const appConfig = require('./webpack');
const merge = require('webpack-merge');
const path = require('path');
const AotPlugin = require('@ngtools/webpack');

module.exports = merge(baseConfig, appConfig, {
    plugins: [
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../../tsconfigApp.json'),
            entryModule: path.resolve(__dirname, './app.module') + '#CdeAppModule'
        }),
    ],
});
