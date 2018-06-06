const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.js');
const path = require('path');

module.exports = merge(baseConfig, {
    mode: 'development',
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'ts-loader', options: {configFile: 'tsconfig.json'}},
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
        ]
    },
    plugins:
        [
            new webpack.ContextReplacementPlugin( // fix "WARNING Critical dependency: the request of a dependency is an expression"
                /@angular(\\|\/)core(\\|\/)esm5/,
                path.resolve(__dirname, '../src')
            ),
            new webpack.DefinePlugin({
                IS_BROWSER: true,
                PRODUCTION: JSON.stringify(false),
            }),
            new webpack.LoaderOptionsPlugin({debug: true}), // enable debug
            new webpack.ProgressPlugin(), // show progress in ConEmu window
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'windows.jQuery': 'jquery',
                Tether: 'tether',
                Popper: ['popper.js', 'default'],
            })
        ],
    devtool: '#eval-source-map',
    watch: true,
    watchOptions: {
        aggregateTimeout: 1000,
        ignored: /node_modules/
    },
    devServer: {
        contentBase: __dirname,
        colors: true,
        hot: true,
        inline: true,
        progress: true
    },
});
