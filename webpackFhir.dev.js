const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.dev');
const fhirConfig = require('./webpackFhir');

module.exports = merge(baseConfig, fhirConfig, {
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'ts-loader', options: {configFile: '../../tsconfigFhir.json', transpileOnly: true}},
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
        ]
    },
});
