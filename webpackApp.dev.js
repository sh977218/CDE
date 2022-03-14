const {createHash} = require('crypto');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.dev');
const appConfig = require('./webpackApp');

function digest(str) {
    return createHash('md5')
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
                    // {loader: 'cache-loader', options: {cacheKey}},
                    {loader: 'ts-loader', options: {configFile: '../../tsconfigApp.json', transpileOnly: true}},
                    // {loader: 'awesome-typescript-loader', options: {configFileName: 'tsconfigApp.json', transpileOnly: true}},
                    {
                        loader: 'ifdef-loader', options: {
                            env: 'BROWSER',
                            "ifdef-uncomment-prefix": "// #code ",
                        }
                    },
                    'angular-router-loader',
                    // 'ng-router-loader'
                    'angular2-template-loader'
                ]
            },
        ]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({typescript: {configFile: 'tsconfigApp.json'}})
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
