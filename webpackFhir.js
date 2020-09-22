const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {resolve} = require('path');
const {DefinePlugin} = require('webpack');

const APP_DIR = __dirname;

module.exports = {
    entry: {
        fhir: './frontEnd/_fhirApp/fhirApp.ts'
    },
    output: {
        path: resolve(APP_DIR, 'dist/fhir'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/fhir/',
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(['dist/fhir'], {root: process.cwd()}),
        new DefinePlugin({
            APPLICATION_NAME: '"CDE FHIR Embed"',
        }),
        new CopyWebpackPlugin([
            {from: 'node_modules/fhirclient/build/fhir-client.js'},
        ]),
    ]
};
