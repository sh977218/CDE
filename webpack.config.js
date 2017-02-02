var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry:  {
        main:'./modules/main.ts',
        print:'./modules/form/public/nativeRenderStandalone.ts',
        embed: './modules/embedded/public/js/embeddedApp.js'
    },
    output: {
        path: path.join(__dirname, 'modules', 'static'), // TODO: temporary until gulp stops packaging vendor.js, then use /dist
        filename: '[name].js'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {test: /.ts$/, enforce: "pre", exclude: /node_modules/, use: ['tslint-loader']},
            {test: /\.ts$/, exclude: /node_modules/, use: ['awesome-typescript-loader', 'angular2-template-loader']},
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {test: /\.ejs$/, use: ['ejs-loader']},
            //{test: /\.html$/, loader: 'html-loader'}
            {test: /\.(html|css)$/, use: ['raw-loader']}
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".html", ".css"],
        modules: ["modules/components", "node_modules"]
    },
    externals: {
        angular: true
    }
};
