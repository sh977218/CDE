var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry:  {
        main:'./modules/main-aot.ts',
        print:'./modules/form/public/nativeRenderStandalone-aot.ts'
    },
    output: {
        path: path.join(__dirname, 'modules', 'static'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        filename: '[name].js'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {test: /.ts$/, enforce: "pre", exclude: /node_modules/, loader: 'tslint-loader'},
            {test: /\.ts$/, exclude: /node_modules/, loaders: ['awesome-typescript-loader', 'angular2-template-loader']},
            {test: /\.css$/, loader: 'style!css'},
            {test: /\.ejs$/, loader: 'ejs-loader'},
            //{test: /\.html$/, loader: 'html-loader'}
            {test: /\.(html|css)$/, loader: 'raw-loader'}
        ]
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            mangle: false,
            sourcemap: true
        })
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".html", ".css"]
    },
    externals: {
        angular: true
    }
};
