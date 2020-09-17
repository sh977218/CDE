const {AngularCompilerPlugin} = require('@ngtools/webpack');
const {resolve} = require('path');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.prod');
const appConfig = require('./webpackApp');

module.exports = merge(baseConfig, appConfig, {
    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: resolve(__dirname, './tsconfigApp.json'),
            entryModule: resolve(__dirname, './modules/_app/app.module') + '#CdeAppModule',
            sourceMap: !!process.env.COVERAGE
        }),
    ],
    devtool: process.env.COVERAGE ? '#source-map' : undefined,
});
