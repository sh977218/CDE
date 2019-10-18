import * as AotPlugin from '@ngtools/webpack';
import * as path from 'path';
import * as merge from 'webpack-merge';
import baseConfig from './webpack.prod';
import appConfig from './webpackApp';

export default merge(baseConfig, appConfig, {
    plugins: [
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, './tsconfigApp.json'),
            entryModule: path.resolve(__dirname, './modules/_app/app.module') + '#CdeAppModule',
            sourceMap: !!process.env.COVERAGE
        }),
    ],
    devtool: process.env.COVERAGE ? '#source-map' : undefined,
} as any);
