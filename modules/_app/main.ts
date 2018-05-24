import 'zone.js';
if (!PRODUCTION) require('../../node_modules/zone.js/dist/long-stack-trace-zone.js');
// reflect-metadata needed before enableProdMode for IE
import 'reflect-metadata';

import '../../node_modules/font-awesome/css/font-awesome.css';
import '../../node_modules/font-awesome-animation/dist/font-awesome-animation.css';

// path to node_modules required to override module/components/bootstrap
import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import '../../node_modules/bootstrap/dist/js/bootstrap.js';
import '../../node_modules/@ng-select/ng-select/themes/default.theme.css';
require('expose-loader?bootstrap!bootstrap');

import '../../node_modules/@angular/material/prebuilt-themes/deeppurple-amber.css';

import { enableProdMode } from '@angular/core';
if (PRODUCTION) enableProdMode();

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CdeAppModule } from '_app/app.module';
platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/);