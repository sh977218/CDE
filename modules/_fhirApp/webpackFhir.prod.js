const baseConfig = require('../../webpack.prod');
const fhirConfig = require('./webpackFhir');
const merge = require('webpack-merge');
const path = require('path');
const AotPlugin = require('@ngtools/webpack');

module.exports = merge(baseConfig, fhirConfig, {
    plugins: [
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../../tsconfigFhir.json'),
            entryModule: path.resolve(__dirname, './fhirApp.module') + '#FhirAppModule'
        }),
    ]
});
