const merge = require('webpack-merge');
const baseConfig = require('../../webpack.prod.js');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const AotPlugin = require('@ngtools/webpack');

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
        new CleanWebpackPlugin(['dist/fhir']),
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, '../../tsconfig.json'),
            entryModule: path.resolve(__dirname, './fhirApp.module') + '#FhirAppModule'
        }),
    ]
});
