import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CdeAppModule } from './app.module';

import 'zone.js/dist/zone.min.js';
import 'reflect-metadata/Reflect';
import 'hammerjs/hammer.min.js';
import 'bootstrap/dist/js/bootstrap.js'; // TODO: .min.js has an error when the first click to open dropdowns does not work
import 'material-design-lite/material.js';

import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../../node_modules/material-design-lite/dist/material.deep_purple-amber.min.css';
// import '../../node_modules/@angular/material/prebuilt-themes/deeppurple-amber.css'; // TODO: wait for @ files omitted bug to be resolved
// import '../../node_modules/@circlon/angular-tree-component/css/angular-tree-component.css';
import '../../node_modules/deeppurple-amber.css';
import '../../node_modules/angular-tree-component.css';
import '../common.scss'; // last, must be after bootstrap to overload

require('expose-loader?bootstrap!bootstrap'); // add to "window"

if (PRODUCTION) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/).catch(console.log);
