switch (process.argv[2]) {
    case 'prod':
        console.log('Starting app.js');
        require('server/app');
        break;
    case 'none':
        console.log('Not starting app.js to allow debug');
        break;
    case 'dev':
        /* falls through */
    default:
        console.log('Starting app.js with nodemon');
        require('./dev-app');
        break;
}

const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
import { htmlServedUri } from 'shared/node/serverConstants';

const cfg = require('./modules/_app/webpackApp.dev.hmr');
const options = {
    contentBase: './dist',
    hot: true,
    host: 'localhost',
    proxy: {
        '/app/*': {
            target: 'http://localhost:8080/', pathRewrite: { '/app/': '/' }, secure: false
        },
        '/cde/public/*': {target: 'http://localhost:3001/', secure: false},
        '/server/system/csrf': {target: 'http://localhost:3001/', secure: false},
        '/form/public/*': {target: 'http://localhost:3001/', secure: false},
        '/server/*': {target: 'http://localhost:3001/', secure: false},
        '/swagger/public/*': {target: 'http://localhost:3001/', secure: false},
        '/system/public/*': {target: 'http://localhost:3001/', secure: false},
    },
    watchContentBase: true,
};
htmlServedUri.forEach(uri => options.proxy[uri] = {target: 'http://localhost:3001/', secure: false});

webpackDevServer.addDevServerEntrypoints(cfg, options);
new webpackDevServer(webpack(cfg), options).listen(8080, 'localhost', () => {
    console.log('dev server listening on port 8080');
});
