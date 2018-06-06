const merge = require('webpack-merge');
const baseConfig = require('../../webpack.dev.js');
const path = require('path');
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
        new CleanWebpackPlugin(['dist/fhir'])
    ]
});
