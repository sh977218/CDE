import 'zone.js';
if (!PRODUCTION)
    require('../../node_modules/zone.js/dist/long-stack-trace-zone.js');
// reflect-metadata needed before enableProdMode for IE
import 'reflect-metadata';

import 'font-awesome/css/font-awesome.css';

// path to node_modules required to override module/components/bootstrap
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../../node_modules/bootstrap/dist/js/bootstrap.min.js';
require('expose-loader?bootstrap!bootstrap');

import { enableProdMode } from '@angular/core';
if (PRODUCTION)
    enableProdMode();

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { EmbedAppModule } from '_embedApp/embedApp.module';
platformBrowserDynamic().bootstrapModule(EmbedAppModule/*, options*/).then(() => {
});
