const _ = require('lodash');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FileListPlugin = require('file-list-plugin');
const serverConstants = require('@std/esm')(module)('../../shared/serverConstants');

const assets = serverConstants.htmlServedUri.concat([
    '/cde/public/assets/img/min/NIH-CDE.png',
    '/cde/public/assets/img/min/NIH-CDE-FHIR.png',
    '/cde/public/assets/img/min/nih-cde-logo-simple.png',
    '/cde/public/assets/img/min/nih-cde-logo.png',
    '/cde/public/assets/img/min/usagov_logo.png',
    '/cde/public/assets/img/min/NLM-logo.png',
    '/system/public/img/doctor-404.png'
]);

module.exports = {
    entry: {
        cde: './modules/_app/main.ts'
    },
    output: {
        path: path.resolve(__dirname, '../../dist/app'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/app/',
        filename: '[name].js',
        chunkFilename: 'cde-[chunkhash].js',
    },
    plugins: [
        new CleanWebpackPlugin(['dist/app'], {root: process.cwd()}),
        new CopyWebpackPlugin([
            {from: 'modules/_app/assets/'},
            {from: 'node_modules/material-design-lite/material.min.js', transform: content => content.toString().replace('//# sourceMappingURL=material.min.js.map', '')},
            {from: 'node_modules/material-design-lite/material.min.css'}
        ]),
        new webpack.DefinePlugin({
            APPLICATION_NAME: '"CDE Repository"',
        }),
        new FileListPlugin({
            fileName: 'sw.js',
            itemsFromCompilation: function defaultItemsFromCompilation(compilation){
                return _.keys(compilation.assets);
            },
            format: function defaultFormat(listItems){
                let sw = fs.readFileSync('modules/_app/sw.template.js', {encoding: 'utf8'});
                let filesInsert = listItems.map(e => '/app/' + e).concat(assets).map(e => '"' + e + '"').join(',');
                let version = crypto.createHash('md5').update(filesInsert).digest('hex').substr(0,4);
                sw = sw.replace('{#}', version);
                sw = sw.replace('{#}', version);
                sw = sw.replace('{htmlServedUri}', serverConstants.htmlServedUri.join('", "'));
                let location = sw.indexOf('"###"');
                let pre = sw.substring(0, location);
                let post = sw.substring(location + 5);
                return pre + filesInsert + post;
            }
        }),
    ],
};
