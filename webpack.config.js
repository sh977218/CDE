const prod = process.env.BUILD_ENV === 'production'; // build type from "npm run build"
const path = require('path');
const webpack = require('webpack');

console.log("Are we prod? " + prod);

module.exports = {
    context: __dirname,
    entry: prod ?
        {
            main:'./modules/main-aot.ts',
            print:'./modules/form/public/nativeRenderStandalone-aot.ts',
            embed: './modules/embedded/public/js/embeddedApp.js'
        } :
        {
            main:'./modules/main.ts',
            print:'./modules/form/public/nativeRenderStandalone.ts',
            embed: './modules/embedded/public/js/embeddedApp.js'
        },
    output: {
        path: path.join(__dirname, 'modules', 'static'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        filename: '[name].js'
    },
    module: {
        rules: [
            {test: /.ts$/, enforce: "pre", exclude: /node_modules/, use: ['tslint-loader']},
            {test: /\.ts$/, exclude: /node_modules/, use: ['ts-loader', 'angular2-template-loader']},
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {test: /\.html$/, use: ['raw-loader']}
        ]
    },
    plugins: prod ?
        [
            new webpack.ContextReplacementPlugin( // fix "WARNING Critical dependency: the request of a dependency is an expression"
                /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
                __dirname
            ),
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
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.LoaderOptionsPlugin({debug: true}), // enable debug
            new webpack.ProgressPlugin() // show progress in ConEmu window
        ],
    resolve: {
        unsafeCache: false,
        extensions: [".ts", ".tsx", ".js", ".json", ".html", ".css"],
        modules: ["modules", "modules/components", "node_modules"]
    },
    devtool: prod ? '#source-map' : '#eval-source-map ',
    watch: !prod,
    watchOptions: {
        aggregateTimeout: 300,
        ignored: /node_modules/,
        poll: 1000
    },
    devServer: {
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
