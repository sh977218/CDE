const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.js');
const path = require('path');

module.exports = merge(baseConfig, {
    mode: 'development',
    plugins: [
        new webpack.ContextReplacementPlugin( // fix "WARNING Critical dependency: the request of a dependency is an expression"
            /@angular(\\|\/)core(\\|\/)esm5/,
            path.resolve(__dirname, '../src')
        ),
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(false),
        }),
        new webpack.LoaderOptionsPlugin({debug: true}), // enable debug
        new webpack.ProgressPlugin() // show progress in ConEmu window
    ],
    devtool: '#eval-source-map',
    watch: true,
    watchOptions: {
        aggregateTimeout: 1000,
        ignored: /node_modules/
    },
    devServer: {
        contentBase: __dirname,
        host: 'localhost',
        hot: true,
        inline: true,
        port: 8080,
        progress: true
    },
});
