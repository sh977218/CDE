import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CdeAppModule } from './app.module';

import 'zone.js/fesm2015/zone.min.js';
import 'reflect-metadata/Reflect';
import 'hammerjs/hammer.min.js';
import 'material-design-lite/material.js';

// TODO: wait for @ files omitted bug to be resolved
// import '../../node_modules/@circlon/angular-tree-component/css/angular-tree-component.css';
import '../../node_modules/angular-tree-component.css';
import './app.scss'; // last, must be after bootstrap to overload

if (PRODUCTION) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/).catch(console.log);
