const baseConfig = require('../../webpack.prod');
const nativeConfig = require('./webpackNative');
const merge = require('webpack-merge');
const path = require('path');
const AotPlugin = require('@ngtools/webpack');

module.exports = merge(baseConfig, nativeConfig, {
    plugins: [
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../../tsconfigNative.json'),
            entryModule: path.resolve(__dirname, './nativeRenderApp.module') + '#NativeRenderAppModule'
        }),
    ]
});
