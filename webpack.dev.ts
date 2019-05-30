import { ContextReplacementPlugin, DefinePlugin, LoaderOptionsPlugin, ProgressPlugin } from 'webpack';
import merge from 'webpack-merge';
import baseConfig from './webpack.config';
import path from 'path';

export default merge(baseConfig, {
    mode: 'development',
    plugins: [
        new ContextReplacementPlugin( // fix "WARNING Critical dependency: the request of a dependency is an expression"
            /@angular(\\|\/)core(\\|\/)esm5/,
            path.resolve(__dirname, '../src')
        ),
        new DefinePlugin({
            PRODUCTION: JSON.stringify(false),
        }),
        new LoaderOptionsPlugin({debug: true}), // enable debug
        new ProgressPlugin() // show progress in ConEmu window
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
} as any);
