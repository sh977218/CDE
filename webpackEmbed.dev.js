const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.dev');
const embedConfig = require('./webpackEmbed');

module.exports = merge(baseConfig, embedConfig, {
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
