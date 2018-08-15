const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
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
        new CopyWebpackPlugin([
            {from: 'node_modules/fhirclient/fhir-client.min.js'},
        ]),
    ]
};
