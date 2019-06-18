const baseConfig = require('../../webpack.dev');
const embedConfig = require('./webpackEmbed');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, embedConfig, {
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'ts-loader', options: {configFile: '../../tsconfigEmbed.json'}},
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
        ]
    },
});
