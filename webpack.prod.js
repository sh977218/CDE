const {DefinePlugin} = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.config');

module.exports = merge(baseConfig, {
    mode: 'production',
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'ts-loader', options: {configFile: '../../tsconfigApp.json', transpileOnly: true}},
                    {
                        loader: 'ifdef-loader', options: {
                            env: 'BROWSER',
                            "ifdef-uncomment-prefix": "// #code ",
                        }
                    },
                    '@ngtools/webpack'
                ]
            }
        ]
    },
    plugins: [
        new DefinePlugin({
            PRODUCTION: JSON.stringify(true),
        }),
    ],
});

if (process.env.BUNDLE_REPORT) {
    module.exports.plugins.push(new BundleAnalyzerPlugin());
}

if (process.env.COVERAGE) {
    module.exports.module.rules.push({
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
