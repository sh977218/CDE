const baseConfig = require('../../webpack.dev');
const nativeConfig = require('./webpackNative');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, nativeConfig, {
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
});
