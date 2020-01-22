import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import { resolve } from 'path';
import { DefinePlugin } from 'webpack';

const APP_DIR = __dirname;

export default {
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
            {from: 'node_modules/fhirclient/fhir-client.min.js'},
        ]),
    ]
};
