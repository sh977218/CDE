const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    context: __dirname,
    module: {
        rules: [
            {test: /\.ts$/, enforce: "pre", exclude: /node_modules/, use: ['tslint-loader']},
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: [["env", { "modules": false }]]
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
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
            {test: /\.css$/, exclude: /node_modules/, use: ['style-loader', 'css-loader']},
            {test: /\.scss$/, exclude: /node_modules/, use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']},
            {test: /\.html$/, use: [{loader: 'html-loader', options: {attrs: ['img:src', 'source:srcset'], minimize: false}}]},
            {test: /\.(eot|png|svg|ttf|webp|woff|woff2)$/, use: [{loader: 'url-loader', options: {limit: '8192'}}]},
            {test: /[\/\\]@angular[\/\\].+\.js$/, parser: { system: true }}
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({filename: '[name].css', chunkFilename: '[name]-[chunkhash].css'}),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'windows.jQuery': 'jquery',
            Tether: 'tether',
            Popper: ['popper.js', 'default'],
        }),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/)
    ],
    performance: { hints: false },
    resolve: {
        unsafeCache: false,
        extensions: [".ts", ".tsx", ".js", ".json", ".html", ".css"],
        modules: ["modules", "node_modules", "modules/components"]
    },
    externals: {
        angular: true
    }
};
