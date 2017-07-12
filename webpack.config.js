const prod = process.env.BUILD_ENV === 'production'; // build type from "npm run build"
const path = require('path');
const webpack = require('webpack');
const AotPlugin = require('@ngtools/webpack');

console.log("Are we prod? " + prod);

module.exports = {
    context: __dirname,
    entry: {
        main: './modules/main.ts',
        print: './modules/form/public/nativeRenderStandalone.ts',
        embed: './modules/embedded/public/js/embeddedApp.js'
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
                /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
                __dirname
            ),
            new AotPlugin.AotPlugin({
                tsConfigPath: './tsconfig.json',
                entryModule: path.join(__dirname, 'modules', 'app.module') + '#CdeAppModule',
                mainPath: 'modules/main-aot'
            }),
            new webpack.DefinePlugin({
                PRODUCTION: JSON.stringify(true),
            }),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.LoaderOptionsPlugin({debug: false, minimize: true}), // minify
            new webpack.optimize.UglifyJsPlugin({ // sourcemap
                mangle: false,
                sourceMap: true,
                output: {
                    comments: false
                },
                compressor: {
                    warnings: false
                }
            })
        ] : [
            new webpack.ContextReplacementPlugin( // fix "WARNING Critical dependency: the request of a dependency is an expression"
                /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
                __dirname
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
        modules: ["modules", "modules/components", "node_modules"]
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
