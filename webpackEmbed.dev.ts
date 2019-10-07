import * as merge from 'webpack-merge';
import baseConfig from './webpack.dev';
import embedConfig from './webpackEmbed';

export default merge(baseConfig, embedConfig, {
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'ts-loader', options: {configFile: '../../tsconfigEmbed.json', transpileOnly: true}},
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
        ]
    },
});
