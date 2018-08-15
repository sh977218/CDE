const baseConfig = require('../../webpack.dev');
const appConfig = require('./webpack');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, appConfig, {
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'ts-loader', options: {configFile: '../../tsconfigApp.json'}},
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
        ]
    },
});
