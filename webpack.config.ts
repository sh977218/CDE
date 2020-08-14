import * as Config from 'config';
import { ContextReplacementPlugin, DefinePlugin, ProvidePlugin } from 'webpack';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';

const config = Config as any;
const APP_DIR = __dirname;

const w: any = {
    context: APP_DIR,
    module: {
        rules: [
            {test: /\.ts$/, enforce: 'pre', exclude: /node_modules/, use: ['tslint-loader']},
            {
                test: /\.js$/,
                exclude: [/node_modules/, /\.module\.ngfactory\.js$/],
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env']
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
                    'css-loader'
                ]
            },
            {test: /\.css$/, exclude: /node_modules/, use: ['style-loader', 'css-loader']},
            {
                test: /common\.scss$/, exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {test: /\.global\.scss$/, exclude: [/node_modules/, /common.scss$/], use: ['style-loader', 'css-loader', 'sass-loader']},
            {test: /\.(style|component)\.scss$/, exclude: [/node_modules/, /common.scss$/], use: ['to-string-loader', 'css-loader', 'sass-loader']},
            {test: /\.html$/, use: [{loader: 'html-loader', options: {attrs: ['img:src', 'source:srcset'], minimize: false}}]},
            {test: /\.(eot|png|svg|ttf|webp|woff|woff2)$/, use: [{loader: 'url-loader', options: {limit: '8192'}}]},
            {test: /[\/\\]@angular[\/\\].+\.js$/, parser: { system: true }}
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({filename: '[name].css', chunkFilename: '[name]-[chunkhash].css'}),
        new ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'windows.jQuery': 'jquery',
            Tether: 'tether',
            Popper: ['popper.js', 'default'],
        }),
        new ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
        new DefinePlugin({
            INACTIVE_TIMEOUT: config.inactivityTimeout,
            NAVIGATION_HEIGHT: 56,
        }),
    ],
    performance: { hints: false },
    resolve: {
        unsafeCache: false,
        extensions: ['.ts', '.tsx', '.js', '.json', '.html', '.css'],
        modules: ['modules', 'node_modules', 'modules/components']
    },
    externals: {
        angular: true
    }
};

export default w;
