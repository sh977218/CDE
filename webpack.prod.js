const {DefinePlugin} = require('webpack');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.config');

const webpackConfigProd = merge(baseConfig, {
    mode: 'production',
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: ['@ngtools/webpack']
            }
        ]
    },
    plugins: [
        new DefinePlugin({
            PRODUCTION: JSON.stringify(true),
        }),
    ],
});

if (process.env.COVERAGE && webpackConfigProd.module) {
    webpackConfigProd.module.rules.push({
        test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
        enforce: 'post',
        exclude: /node_modules|\.spec\.js$/,
        use: [
            {
                loader: 'istanbul-instrumenter-loader',
                query: {
                    esModules: true
                },
            }
        ],
    });
}

module.exports = webpackConfigProd;
