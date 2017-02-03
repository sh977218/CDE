const prod = process.argv.indexOf('-p') !== -1;
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
            {test: /\.ejs$/, use: ['ejs-loader']},
            {test: /\.js$/, enforce: "pre", use: ["source-map-loader"]},
            //{test: /\.html$/, loader: 'html-loader'}
            {test: /\.html$/, use: ['raw-loader']}
        ]
    },
    plugins: prod ?
        [
            new webpack.DefinePlugin({'process.env': {'NODE_ENV': `"production"`}}),
            new webpack.optimize.UglifyJsPlugin({
                mangle: false,
                sourcemap: true
            }),
            new HtmlWebpackPlugin({title: 'Tree-shaking'})
        ] : [
            new webpack.DefinePlugin({'process.env': {'NODE_ENV': `""`}}),
            new webpack.EnvironmentPlugin(['NODE_ENV']),
            new webpack.LoaderOptionsPlugin({debug: true}),
            new webpack.ProgressPlugin()
        ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".html", ".css"],
        modules: ["modules/components", "node_modules"]
    },
    // devtool: prod ? 'source-map' : 'source-map',
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
