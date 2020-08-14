import { AngularCompilerPlugin } from '@ngtools/webpack';
import { resolve } from 'path';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.prod';
import embedConfig from './webpackEmbed';

export default merge(baseConfig, embedConfig, {
    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: resolve(__dirname, './tsconfigEmbed.json'),
            entryModule: resolve(__dirname, './frontEnd/_embedApp/embedApp.module') + '#EmbedAppModule'
        }),
    ],
});
