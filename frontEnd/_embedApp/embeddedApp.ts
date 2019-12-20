import 'zone.js';
// reflect-metadata needed before enableProdMode for IE
import 'reflect-metadata';

// path to node_modules required to override module/components/bootstrap
import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import '../../node_modules/bootstrap/dist/js/bootstrap.js';
require('expose-loader?bootstrap!bootstrap');

import '../../node_modules/deeppurple-amber.css';

import { enableProdMode } from '@angular/core';
if (PRODUCTION) {
    enableProdMode();
}

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { EmbedAppModule } from './embedApp.module';
platformBrowserDynamic().bootstrapModule(EmbedAppModule/*, options*/).then(() => {
});

// must be after bootstrap to overload material styles
import '../../modules/common.scss';
