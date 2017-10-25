// WORKAROUND: for no multiple entry points issue https://github.com/angular/angular-cli/issues/5072
const prod = process.env.BUILD_ENV === 'production'; // build type from "npm run build"
const path = require('path');
const webpack = require('webpack');
const AotPlugin = require('@ngtools/webpack');

console.log("Are we prod? " + prod);

module.exports = {
    context: __dirname,
    entry: {
        print: './modules/formStandaloneApp/nativeRenderStandalone.ts'
    },
    output: {
        path: path.join(__dirname, 'modules', 'static'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        filename: '[name].js'
    },
    module: {
        rules: [
            {test: /\.ts$/, enforce: "pre", exclude: /node_modules/, use: ['tslint-loader']},
            {
                test: /\.ts$/,
                use: prod ? ['@ngtools/webpack', 'angular2-template-loader'] : ['ts-loader', 'angular2-template-loader']
            },
            {test: /\.css$/, use: ['style-loader?insertAt=top', 'raw-loader']},
            {test: /\.html$/, use: ['raw-loader']}
        ]
    },
    plugins: prod ?
        [
            new webpack.ContextReplacementPlugin( // fix "WARNING Critical dependency: the request of a dependency is an expression"
                /angular(\\|\/)core(\\|\/)@angular/,
                path.resolve(__dirname, '../src')
            ),
            new AotPlugin.AotPlugin({
                tsConfigPath: './tsconfig.json',
                entryModule: path.join(__dirname, 'modules', 'formStandaloneApp', 'nativeRenderStandalone.module') + '#NativeRenderStandaloneModule'
            }),
            new webpack.DefinePlugin({
                PRODUCTION: JSON.stringify(true),
            }),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.LoaderOptionsPlugin({debug: false, minimize: true}), // minify
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
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'windows.jQuery': 'jquery'
            })
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
            new webpack.ProgressPlugin() // show progress in ConEmu window
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
