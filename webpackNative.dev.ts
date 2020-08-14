import { merge } from 'webpack-merge';
import baseConfig from './webpack.dev';
import nativeConfig from './webpackNative';

export default merge(baseConfig, nativeConfig, {
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'ts-loader', options: {configFile: './tsconfigNative.json'}},
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
        ]
    },
});
