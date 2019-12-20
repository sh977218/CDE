import * as AotPlugin from '@ngtools/webpack';
import * as path from 'path';
import * as merge from 'webpack-merge';
import baseConfig from './webpack.prod';
import embedConfig from './webpackEmbed';

export default merge(baseConfig, embedConfig, {
    plugins: [
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, './tsconfigEmbed.json'),
            entryModule: path.resolve(__dirname, './frontEnd/_embedApp/embedApp.module') + '#EmbedAppModule'
        }),
    ],
});
