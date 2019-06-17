import merge from 'webpack-merge';
import baseConfig from './webpack.dev';
import fhirConfig from './webpackFhir';

export default merge(baseConfig, fhirConfig, {
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [
                    {loader: 'ts-loader', options: {configFile: './tsconfigFhir.json'}},
                    'angular-router-loader',
                    'angular2-template-loader'
                ]
            },
        ]
    },
});
