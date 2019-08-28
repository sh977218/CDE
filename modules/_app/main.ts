import 'zone.js';
// reflect-metadata needed before enableProdMode for IE
import 'reflect-metadata';

// path to node_modules required to override module/components/bootstrap
import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import '../../node_modules/bootstrap/dist/js/bootstrap.js';
require('expose-loader?bootstrap!bootstrap');

// import '../../node_modules/material-design-icons/iconfont/material-icons.css';
import '../../node_modules/deeppurple-amber.css';

import { enableProdMode } from '@angular/core';
if (PRODUCTION) {
    enableProdMode();
}

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CdeAppModule } from './app.module';
import { MatIconRegistry } from '@angular/material';
platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/);

// must be after bootstrap to overload material styles
import '../common.scss';
