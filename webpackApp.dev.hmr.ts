import { HotModuleReplacementPlugin } from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './webpackApp.dev';

export default merge(baseConfig, {
    plugins: [
        new HotModuleReplacementPlugin()
    ],
});
