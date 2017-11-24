const prod = process.env.BUILD_ENV === 'production'; // build type from "npm run build"
const path = require('path');
const webpack = require('webpack');
const AotPlugin = require('@ngtools/webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
// let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
                test: /\.ts$/,
                use: prod ? ['@ngtools/webpack'] : ['ts-loader', 'angular-router-loader', 'angular2-template-loader']
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
            {test: /\.css$/, exclude: /node_modules/, use: ['style-loader?insertAt=top', 'css-loader']},
            {test: /\.html$/, use: [{loader: 'html-loader', options: {minimize: false}}]},
            {test: /\.(eot|png|svg|ttf|woff|woff2)$/, use: [{loader: 'url-loader', options: {limit: '8192'}}]},
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
                '$': 'jquery',
                'jQuery': 'jquery',
                'window.jQuery': 'jquery',
                'Tether': 'tether',
                'Popper': ['popper.js', 'default'],
            }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new AotPlugin.AotPlugin({
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
            // new BundleAnalyzerPlugin()
        ] : [
            new CleanWebpackPlugin(['dist/app']),
            new webpack.ContextReplacementPlugin( // fix "WARNING Critical dependency: the request of a dependency is an expression"
                /angular(\\|\/)core(\\|\/)@angular/,
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
                '$': 'jquery',
                'jQuery': 'jquery',
                'window.jQuery': 'jquery',
                'Tether': 'tether',
                'Popper': ['popper.js', 'default'],
            }),
            new ExtractTextPlugin({filename: '[name].css'}),
            new CopyWebpackPlugin([
                {from: 'modules/_app/assets/'}
            ]),
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
