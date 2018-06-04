const prod = process.env.BUILD_ENV === 'production'; // build type from "npm run build"
const _ = require('lodash');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const AotPlugin = require('@ngtools/webpack');
const { CheckerPlugin } = require('awesome-typescript-loader');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FileListPlugin = require('file-list-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
// let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const assets = [
    '/cde/public/assets/img/min/NIH-CDE.png',
    '/cde/public/assets/img/min/nih-cde-logo-simple.png',
    '/cde/public/assets/img/min/nih-cde-logo.png',
    '/cde/public/assets/img/min/usagov_logo.png',
    '/cde/public/assets/img/min/NLM-logo.png',
    '/app/styles-cde.css'
];

console.log("Are we prod? " + prod);

module.exports = {
    context: __dirname,
    entry: {
        cde: './modules/main.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist/app'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/app/',
        filename: '[name].js',
        chunkFilename: 'cde-[chunkhash].js',
    },
    module: {
        rules: [
            {test: /\.ts$/, enforce: "pre", exclude: /node_modules/, use: ['tslint-loader']},
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: prod ? ['@ngtools/webpack'] : [
                    {loader: 'awesome-typescript-loader', options: {configFile: 'tsconfig.json'}},
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['env']
                }
            },
            {
                test: require.resolve('jquery'),
                use: [{
                    loader: 'expose-loader',
                    options: '$'
                }]
            },
            {
                test: /\.css$/, include: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {test: /\.css$/, exclude: /node_modules/, use: ['style-loader', 'css-loader']},
            {test: /\.scss$/, exclude: /node_modules/, use: ['style-loader', 'css-loader', 'sass-loader']},
            {test: /\.html$/, use: [{loader: 'html-loader', options: {attrs: ['img:src', 'source:srcset'], minimize: false}}]},
            {test: /\.(eot|png|svg|ttf|webp|woff|woff2)$/, use: [{loader: 'url-loader', options: {limit: '8192'}}]},
        ]
    },
    plugins: prod ?
        [
            new CleanWebpackPlugin(['dist/app']),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.LoaderOptionsPlugin({debug: false, minimize: true}), // minify
            new webpack.DefinePlugin({
                IS_BROWSER: true,
                PRODUCTION: JSON.stringify(true),
            }),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'windows.jQuery': 'jquery',
                Tether: 'tether',
                Popper: ['popper.js', 'default'],
            }),
            new AotPlugin.AngularCompilerPlugin({
                tsConfigPath: path.resolve(__dirname, 'tsconfig.json'),
                entryModule: path.resolve(__dirname, 'modules/_app/app.module') + '#CdeAppModule'
            }),
            new webpack.optimize.UglifyJsPlugin({
                output: {
                    comments: false
                },
                parallel: true,
                uglifyOptions: {
                    ie8: false,
                    ecma: 5,
                    warnings: true,
                    mangle: true, // debug false
                    output: {
                        comments: false,
                        beautify: false,  // debug true
                    }
                },
                warnings: true,
            }),
            new ExtractTextPlugin({filename: '[name].css'}),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new OptimizeJsPlugin({
                sourceMap: false
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: ['cde'],
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: ['cde'],
                children: true,
                async: true,
                minChunks: 15,
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: ['cde'],
                children: true,
                async: true,
                minChunks: 10,
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: ['cde'],
                children: true,
                async: true,
                minChunks: 5,
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: ['cde'],
                children: true,
                async: true,
                minChunks: 3,
            }),
            new CopyWebpackPlugin([
                {from: 'modules/_app/assets/'}
            ]),
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
                    let location = sw.indexOf('"###"');
                    let pre = sw.substring(0, location);
                    let post = sw.substring(location + 5);
                    return pre + filesInsert + post;
                }
            }),
            // new BundleAnalyzerPlugin()
        ] : [
            new CleanWebpackPlugin(['dist/app']),
            new webpack.ContextReplacementPlugin( // fix "WARNING Critical dependency: the request of a dependency is an expression"
                /@angular(\\|\/)core(\\|\/)esm5/,
                path.resolve(__dirname, '../src')
            ),
            new webpack.DefinePlugin({
                IS_BROWSER: true,
                PRODUCTION: JSON.stringify(false),
            }),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.LoaderOptionsPlugin({debug: true}), // enable debug
            new webpack.ProgressPlugin(), // show progress in ConEmu window
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'windows.jQuery': 'jquery',
                Tether: 'tether',
                Popper: ['popper.js', 'default'],
            }),
            new CheckerPlugin(),
            new HardSourceWebpackPlugin(),
            new ExtractTextPlugin({filename: '[name].css'}),
            new CopyWebpackPlugin([
                {from: 'modules/_app/assets/'}
            ]),
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
                    let location = sw.indexOf('"###"');
                    let pre = sw.substring(0, location);
                    let post = sw.substring(location + 5);
                    return pre + filesInsert + post;
                }
            }),
        ],
    resolve: {
        unsafeCache: false,
        extensions: [".ts", ".tsx", ".js", ".json", ".html", ".css"],
        modules: ["modules", "node_modules", "modules/components"]
    },
    devtool: prod ? undefined : '#cheap-eval-source-map',
    watch: !prod,
    watchOptions: prod ? undefined : {
        aggregateTimeout: 1000,
        ignored: /node_modules/
    },
    devServer: prod ? undefined : {
        contentBase: __dirname,
        colors: true,
        hot: true,
        inline: true,
        progress: true
    },
    externals: {
        angular: true
    }
};
