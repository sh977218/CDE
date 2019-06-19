import { createHash } from 'crypto';
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import * as merge from 'webpack-merge';
import baseConfig from './webpack.dev';
import appConfig from './webpackApp';

function digest(str) {
    return createHash('md5')
        .update(str)
        .digest('hex');
}

function cacheKey(options, request) {
    return `build:cache:${digest(request)}`;
}

export default merge(baseConfig, appConfig, {
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
} as any);
