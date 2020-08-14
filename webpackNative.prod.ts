import { AngularCompilerPlugin } from '@ngtools/webpack';
import { resolve } from 'path';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.prod';
import nativeConfig from './webpackNative';

export default merge(baseConfig, nativeConfig, {
    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: resolve(__dirname, './tsconfigNative.json'),
            entryModule: resolve(__dirname, './frontEnd/_nativeRenderApp/nativeRenderApp.module') + '#NativeRenderAppModule'
        }),
    ]
});
