import { HotModuleReplacementPlugin } from 'webpack';
import * as merge from 'webpack-merge';
import baseConfig from './webpackApp.dev';

export default merge(baseConfig, {
    plugins: [
        new HotModuleReplacementPlugin()
    ],
});
