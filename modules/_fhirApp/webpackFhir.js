const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        fhir: './modules/_fhirApp/fhirApp.ts'
    },
    output: {
        path: path.resolve(__dirname, '../../dist/fhirApp'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/fhirApp/',
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(['dist/fhirApp'], {root: process.cwd()}),
        new webpack.DefinePlugin({
            APPLICATION_NAME: '"CDE FHIR Embed"',
        }),
        new CopyWebpackPlugin([
            {from: 'node_modules/fhirclient/fhir-client.min.js'},
        ]),
    ]
};
