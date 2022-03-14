const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.dev');
const nativeConfig = require('./webpackNative');

module.exports = merge(baseConfig, nativeConfig, {
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'ts-loader', options: {configFile: '../../tsconfigNative.json', transpileOnly: true}},
                    {
                        loader: 'ifdef-loader', options: {
                            env: 'BROWSER',
                            "ifdef-uncomment-prefix": "// #code ",
                        }
                    },
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
        ]
    },
});
