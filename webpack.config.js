const config = require('config');
const path = require('path');
const {ContextReplacementPlugin, DefinePlugin, NormalModuleReplacementPlugin, ProvidePlugin} = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const APP_DIR = __dirname;

module.exports = {
    context: APP_DIR,
    module: {
        rules: [
            {test: /\.ts$/, enforce: 'pre', exclude: /node_modules/, use: ['tslint-loader']},
            {
                // dev only, does not fail build, AOT compiler does not generate html resources
                test: /\.html$/,
                enforce: 'pre',
                use: [{loader: path.resolve('scripts/htmlValidateLoader.js')}],
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/, /\.module\.ngfactory\.js$/],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    },
                },
            },
            {
                test: require.resolve('jquery'),
                use: [{
                    loader: 'expose-loader',
                    options: {
                        exposes: ['$'],
                    }
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
                test: /(common|app)\.scss$/, exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {test: /\.global\.scss$/, exclude: [/node_modules/, /common.scss$/], use: ['style-loader', 'css-loader', 'sass-loader']},
            {
                test: /\.(style|component)\.scss$/,
                exclude: [/node_modules/, /common.scss$/],
                use: ['to-string-loader', 'css-loader', 'sass-loader']
            },
            {test: /\.html$/, use: [{loader: 'html-loader', options: {attrs: ['img:src', 'source:srcset'], minimize: false}}]},
            {test: /\.(eot|png|svg|ttf|webp|woff|woff2)$/, use: [{loader: 'url-loader', options: {limit: 8192, esModule: false}}]},
            {test: /[\/\\]@angular[\/\\].+\.js$/, parser: {system: true}}
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
        new NormalModuleReplacementPlugin(/^async$/, 'async-es'),
        new NormalModuleReplacementPlugin(/^lodash$/, 'lodash-es'),
        new DefinePlugin({
            INACTIVE_TIMEOUT: config.inactivityTimeout,
            NAVIGATION_HEIGHT: 102,
            NAVIGATION_HEIGHT_MOBILE: 80,
        }),
    ],
    performance: {hints: false},
    resolve: {
        unsafeCache: false,
        extensions: ['.ts', '.tsx', '.js', '.json', '.html', '.css'],
        modules: ['modules', 'node_modules', 'modules/components']
    },
    externals: {
        angular: true
    }
};
