const baseConfig = require('../../webpack.dev');
const appConfig = require('./webpackApp');
const merge = require('webpack-merge');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const crypto = require('crypto');

function digest(str) {
    return crypto
        .createHash('md5')
        .update(str)
        .digest('hex');
}

function cacheKey(options, request) {
    return `build:cache:${digest(request)}`;
}

module.exports = merge(baseConfig, appConfig, {
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'cache-loader', options: {cacheKey}},
                    {loader: 'ts-loader', options: {configFile: '../../tsconfigApp.json', transpileOnly: true}},
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
        ]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({tsconfig: 'tsconfigApp.json'})
    ],
    stats: {
        warningsFilter: /export .* was not found in/
    },
    devServer: {
        stats: {
            warningsFilter: /export .* was not found in/
        }
    }
});
