import { AngularCompilerPlugin } from '@ngtools/webpack';
import { resolve } from 'path';
import { merge } from 'webpack-merge';
import baseConfig from './webpack.prod';
import fhirConfig from './webpackFhir';

export default merge(baseConfig, fhirConfig, {
    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: resolve(__dirname, './tsconfigFhir.json'),
            entryModule: resolve(__dirname, './frontEnd/_fhirApp/fhirApp.module') + '#FhirAppModule'
        }),
    ]
});
