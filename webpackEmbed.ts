import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import { resolve } from 'path';
import { DefinePlugin } from 'webpack';

const APP_DIR = __dirname;

export default {
    entry: {
        embed: './frontEnd/_embedApp/embeddedApp.ts'
    },
    output: {
        path: resolve(APP_DIR, 'dist/embed'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/embed/',
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(['dist/embed'], {root: process.cwd()}),
        new DefinePlugin({
            APPLICATION_NAME: '"CDE Search Embed"',
        }),
    ],
};
