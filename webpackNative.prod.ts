import * as AotPlugin from '@ngtools/webpack';
import * as path from 'path';
import * as merge from 'webpack-merge';
import baseConfig from './webpack.prod';
import nativeConfig from './webpackNative';

export default merge(baseConfig, nativeConfig, {
    plugins: [
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, './tsconfigNative.json'),
            entryModule: path.resolve(__dirname, './frontEnd/_nativeRenderApp/nativeRenderApp.module') + '#NativeRenderAppModule'
        }),
    ]
});
