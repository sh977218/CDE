import { AngularCompilerPlugin } from '@ngtools/webpack';
import { resolve } from 'path';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.prod';
import appConfig from './webpackApp';

export default merge(baseConfig, appConfig, {
    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: resolve(__dirname, './tsconfigApp.json'),
            entryModule: resolve(__dirname, './modules/_app/app.module') + '#CdeAppModule',
            sourceMap: !!process.env.COVERAGE
        }),
    ],
    devtool: process.env.COVERAGE ? '#source-map' : undefined,
} as any);
