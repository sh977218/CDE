const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {createHash} = require('crypto');
const FileListPlugin = require('file-list-plugin');
const {readFileSync} = require('fs');
const {keys} = require('lodash');
const {resolve} = require('path');
const {htmlServedUri} = require('shared/node/serverConstants');
const {DefinePlugin} = require('webpack');

const APP_DIR = __dirname;

const assets = [
    '/cde/public/assets/img/min/NIH-CDE.svg',
    '/cde/public/assets/img/min/nih-cde-logo-simple.png',
    '/cde/public/assets/img/min/usagov_logo.png',
    '/cde/public/assets/img/min/NLM-logo.png',
];

module.exports = {
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
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {from: 'modules/_app/assets/'},
                {
                    from: 'node_modules/material-design-lite/material.min.js',
                    transform: (content/*Buffer*/) => content.toString()
                        .replace('//# sourceMappingURL=material.min.js.map', '')
                },
                {from: 'node_modules/material-design-lite/material.min.css'}
            ]
        }),
        new DefinePlugin({
            APPLICATION_NAME: '"CDE Repository"',
        }),
        new FileListPlugin({
            fileName: 'sw.js',
            itemsFromCompilation: function defaultItemsFromCompilation(compilation) {
                return keys(compilation.assets);
            },
            format: function defaultFormat(listItems /*string[]*/) {
                let sw = readFileSync('modules/_app/sw.template.js', {encoding: 'utf8'});
                const filesInsert = listItems.map(e => '/app/' + e).concat(assets).map(e => '"' + e + '"').join(',');
                const version = createHash('md5').update(filesInsert).digest('hex').substr(0, 4);
                sw = sw.replace('{#}', version);
                sw = sw.replace('{#}', version);
                sw = sw.replace('{htmlServedUri}', htmlServedUri.join('", "'));
                const location = sw.indexOf('"###"');
                const pre = sw.substring(0, location);
                const post = sw.substring(location + 5);
                return pre + filesInsert + post;
            }
        }),
    ],
};
