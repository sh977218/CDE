var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry:  {
        main:'./modules/main.ts',
        print:'./modules/form/public/nativeRenderStandalone.ts'
    },
    output: {
        path: path.join(__dirname, 'modules', 'static'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        filename: '[name].js'
    },
    devtool: 'source-map',
    module: {
        preloaders: [
            {test: /.ts$/, exclude: /node_modules/, loader: 'tshint-loader'}
        ],
        loaders: [
            {test: /\.ts$/, exclude: /node_modules/, loaders: ['awesome-typescript-loader', 'angular2-template-loader']},
            {test: /\.css$/, loader: 'style!css'},
            {test: /\.ejs$/, loader: 'ejs-loader'},
            //{test: /\.html$/, loader: 'html-loader'}
            {test: /\.(html|css)$/, loader: 'raw-loader'}
        ]
    },
    resolve: {
        extensions: ["", ".ts", ".tsx", ".js", ".html", ".css"],
        modulesDirectories: ["modules/components", "node_modules"]
    },
    externals: {
        angular: true
    }
};
