const {AngularWebpackPlugin} = require('@ngtools/webpack');
const {resolve} = require('path');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.prod');
const nativeConfig = require('./webpackNative');

module.exports = merge(baseConfig, nativeConfig, {
    plugins: [
        new AngularWebpackPlugin({
            tsconfig: resolve(__dirname, './tsconfigNative.json'),
            entryModule: resolve(__dirname, './frontEnd/_nativeRenderApp/nativeRenderApp.module') + '#NativeRenderAppModule'
        }),
    ]
});
