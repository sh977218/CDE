const {AngularCompilerPlugin} = require('@ngtools/webpack');
const {resolve} = require('path');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.prod');
const fhirConfig = require('./webpackFhir');

module.exports = merge(baseConfig, fhirConfig, {
    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: resolve(__dirname, './tsconfigFhir.json'),
            entryModule: resolve(__dirname, './frontEnd/_fhirApp/fhirApp.module') + '#FhirAppModule'
        }),
    ]
});
