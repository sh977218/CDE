import { DefinePlugin } from 'webpack';
import * as merge from 'webpack-merge';
import baseConfig from './webpack.config';

export default merge(baseConfig, {
    mode: 'production',
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: ['@ngtools/webpack']
            },
        ]
    },
    plugins: [
        new DefinePlugin({
            PRODUCTION: JSON.stringify(true),
        }),
    ]
});
