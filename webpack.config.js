const prod = process.env.BUILD_ENV === 'production'; // build type from "npm run build"
const path = require('path');
const webpack = require('webpack');
const AotPlugin = require('@ngtools/webpack');
// let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

console.log("Are we prod? " + prod);

module.exports = {
    context: __dirname,
    entry: {
        cde: './modules/main.ts',
    },
    output: {
        path: path.join(__dirname, 'modules', 'static'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        publicPath: '/static/',
        filename: '[name].js',
        chunkFilename: 'cde-[name].js',
    },
    module: {
        rules: [
            {test: /\.ts$/, enforce: "pre", exclude: /node_modules/, use: ['tslint-loader']},
            {
                test: /\.ts$/,
                use: prod ? ['@ngtools/webpack'] : ['ts-loader', 'angular-router-loader', 'angular2-template-loader']
            },
            {test: /\.css$/, use: ['style-loader?insertAt=top', 'css-loader']},
            {test: /\.html$/, use: [{loader: 'html-loader', options: {minimize: false} }]},
            {test: /\.png$/, use: [{loader: 'url-loader', options: {limit: '8192'}}]}
        ]
    },
    plugins: prod ?
        [
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.LoaderOptionsPlugin({debug: false, minimize: true}), // minify
            new webpack.DefinePlugin({
                PRODUCTION: JSON.stringify(true),
            }),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'windows.jQuery': 'jquery',
                'Tether':'tether',
                Popper: ['popper.js', 'default'],
            }),
            new AotPlugin.AotPlugin({
                tsConfigPath: path.resolve(__dirname, 'tsconfig.json'),
                entryModule: path.resolve(__dirname, 'modules/_app/app.module') + '#CdeAppModule'
            }),
            new webpack.optimize.UglifyJsPlugin({ // sourcemap
                mangle: true,
                sourceMap: true,
                output: {
                    comments: false
                },
                compress: {
                    warnings: false
                }
            }),
            // new BundleAnalyzerPlugin()
        ] : [
            new webpack.ContextReplacementPlugin( // fix "WARNING Critical dependency: the request of a dependency is an expression"
                /angular(\\|\/)core(\\|\/)@angular/,
                path.resolve(__dirname, '../src')
            ),
            new webpack.DefinePlugin({
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
            })
        ],
    resolve: {
        unsafeCache: false,
        extensions: [".ts", ".tsx", ".js", ".json", ".html", ".css"],
        modules: ["modules", "node_modules", "modules/components"]
    },
    devtool: prod ? '#source-map' : '#cheap-eval-source-map',
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
