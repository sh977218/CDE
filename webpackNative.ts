import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import { resolve } from 'path';
import { DefinePlugin } from 'webpack';

const APP_DIR = __dirname;

export default {
    entry: {
        native: './modules/_nativeRenderApp/nativeRenderApp.ts'
    },
    output: {
        path: resolve(APP_DIR, 'dist/native'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/native/',
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(['dist/native'], {root: process.cwd()}),
        new DefinePlugin({
            APPLICATION_NAME: '"CDE Form Embed"',
        }),
    ]
};
