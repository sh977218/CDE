// WORKAROUND: for no multiple entry points issue https://github.com/angular/angular-cli/issues/5072
const prod = process.env.BUILD_ENV === 'production'; // build type from "npm run build"
const path = require('path');
const webpack = require('webpack');
const AotPlugin = require('@ngtools/webpack');
const { CheckerPlugin } = require('awesome-typescript-loader');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
// let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

console.log("Are we prod? " + prod);

module.exports = {
    context: __dirname,
    entry: {
        embed: './modules/_embedApp/embeddedApp.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist/embed'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        filename: '[name].js'
    },
    module: {
        rules: [
            {test: /\.ts$/, enforce: "pre", exclude: /node_modules/, use: ['tslint-loader']},
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: prod ? ['@ngtools/webpack'] : [
                    {loader: 'awesome-typescript-loader', options: {configFile: 'tsconfigEmbed.json'}},
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
                test: /\.css$/, include: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {test: /\.css$/, exclude: /node_modules/, use: ['style-loader', 'css-loader']},
            {test: /\.html$/, use: [{loader: 'html-loader', options: {attrs: ['img:src', 'source:srcset'], minimize: false}}]},
            {test: /\.(eot|png|svg|ttf|webp|woff|woff2)$/, use: [{loader: 'url-loader', options: {limit: '8192'}}]},
        ]
    },
    plugins: prod ?
        [
            new CleanWebpackPlugin(['dist/embed']),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.LoaderOptionsPlugin({debug: false, minimize: true}), // minify
            new webpack.ContextReplacementPlugin( // fix "WARNING Critical dependency: the request of a dependency is an expression"
                /@angular(\\|\/)core(\\|\/)esm5/,
                path.resolve(__dirname, '../src')
            ),
            new webpack.DefinePlugin({
                IS_BROWSER: true,
                PRODUCTION: JSON.stringify(true),
            }),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'windows.jQuery': 'jquery',
                Tether:'tether',
                Popper: ['popper.js', 'default'],
            }),
            new AotPlugin.AngularCompilerPlugin({
                tsConfigPath: path.resolve(__dirname, 'tsconfigEmbed.json'),
                entryModule: path.join(__dirname, 'modules', '_embedApp/embedApp.module') + '#EmbedAppModule',
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
            // new CopyWebpackPlugin([
            //     {from: 'modules/_embedApp/assets/'}
            // ]),
            // new BundleAnalyzerPlugin()
        ] : [
            new CleanWebpackPlugin(['dist/embed']),
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
                'Tether':'tether',
                Popper: ['popper.js', 'default'],
            }),
            new CheckerPlugin(),
            new HardSourceWebpackPlugin(),
            new ExtractTextPlugin({filename: '[name].css'}),
            // new CopyWebpackPlugin([
            //     {from: 'modules/_embedApp/assets/'}
            // ]),
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
