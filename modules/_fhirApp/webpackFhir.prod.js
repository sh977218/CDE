const baseConfig = require('../../webpack.prod.js');
const merge = require('webpack-merge');
const path = require('path');
const AotPlugin = require('@ngtools/webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(baseConfig, {
    entry: {
        fhir: './modules/_fhirApp/fhirApp.ts'
    },
    output: {
        path: path.resolve(__dirname, '../../dist/fhir'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/fhir/',
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(['dist/fhir'], {root: process.cwd()}),
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../../tsconfigFhir.json'),
            entryModule: path.resolve(__dirname, './fhirApp.module') + '#FhirAppModule'
        }),
    ]
});
