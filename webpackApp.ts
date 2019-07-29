import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import { createHash } from 'crypto';
import * as FileListPlugin from 'file-list-plugin';
import { readFileSync } from 'fs';
import { keys } from 'lodash';
import { resolve } from 'path';
import { DefinePlugin } from 'webpack';
import { htmlServedUri } from 'shared/serverConstants';

const APP_DIR = __dirname;

const assets = [
    '/cde/public/assets/img/min/NIH-CDE.png',
    '/cde/public/assets/img/min/NIH-CDE-FHIR.png',
    '/cde/public/assets/img/min/nih-cde-logo-simple.png',
    '/cde/public/assets/img/min/nih-cde-logo.png',
    '/cde/public/assets/img/min/usagov_logo.png',
    '/cde/public/assets/img/min/NLM-logo.png',
];

export default {
    entry: {
        cde: './modules/_app/main.ts'
    },
    output: {
        path: resolve(APP_DIR, 'dist/app'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/app/',
        filename: '[name].js',
        chunkFilename: 'cde-[chunkhash].js',
    },
    plugins: [
        new CleanWebpackPlugin(['dist/app'], {root: process.cwd()}),
        new CopyWebpackPlugin([
            {from: 'modules/_app/assets/'},
            {from: 'node_modules/material-design-lite/material.min.js', transform: (content: any) => content.toString().replace('//# sourceMappingURL=material.min.js.map', '')},
            {from: 'node_modules/material-design-lite/material.min.css'}
        ]),
        new DefinePlugin({
            APPLICATION_NAME: '"CDE Repository"',
        }),
        new FileListPlugin({
            fileName: 'sw.js',
            itemsFromCompilation: function defaultItemsFromCompilation(compilation: any) {
                return keys(compilation.assets);
            },
            format: function defaultFormat(listItems: string[]) {
                let sw = readFileSync('modules/_app/sw.template.js', {encoding: 'utf8'});
                let filesInsert = listItems.map(e => '/app/' + e).concat(assets).map(e => '"' + e + '"').join(',');
                let version = createHash('md5').update(filesInsert).digest('hex').substr(0, 4);
                sw = sw.replace('{#}', version);
                sw = sw.replace('{#}', version);
                sw = sw.replace('{htmlServedUri}', htmlServedUri.join('", "'));
                let location = sw.indexOf('"###"');
                let pre = sw.substring(0, location);
                let post = sw.substring(location + 5);
                return pre + filesInsert + post;
            }
        }),
    ],
};
