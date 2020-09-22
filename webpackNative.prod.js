const {AngularCompilerPlugin} = require('@ngtools/webpack');
const {resolve} = require('path');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.prod');
const nativeConfig = require('./webpackNative');

module.exports = merge(baseConfig, nativeConfig, {
    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: resolve(__dirname, './tsconfigNative.json'),
            entryModule: resolve(__dirname, './frontEnd/_nativeRenderApp/nativeRenderApp.module') + '#NativeRenderAppModule'
        }),
    ]
});
