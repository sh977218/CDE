import * as AotPlugin from '@ngtools/webpack';
import * as path from 'path';
import * as merge from 'webpack-merge';
import baseConfig from './webpack.prod';
import fhirConfig from './webpackFhir';

export default merge(baseConfig, fhirConfig, {
    plugins: [
        new AotPlugin.AngularCompilerPlugin({
            tsConfigPath: path.resolve(__dirname, './tsconfigFhir.json'),
            entryModule: path.resolve(__dirname, './frontEnd/_fhirApp/fhirApp.module') + '#FhirAppModule'
        }),
    ]
});
