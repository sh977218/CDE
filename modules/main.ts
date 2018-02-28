import 'zone.js';
if (!PRODUCTION) require('../node_modules/zone.js/dist/long-stack-trace-zone.js');
// reflect-metadata needed before enableProdMode for IE
import 'reflect-metadata';

import { faCog } from '../node_modules/@fortawesome/fontawesome-free-solid';
import { faSquare } from '../node_modules/@fortawesome/fontawesome-free-regular';
import fontawesome from '../node_modules/@fortawesome/fontawesome';
fontawesome.library.add(faCog);
fontawesome.library.add(faSquare);

// path to node_modules required to override module/components/bootstrap
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/bootstrap/dist/js/bootstrap.js';
require('expose-loader?bootstrap!bootstrap');

// required for ng2-select2
import '../node_modules/select2/dist/js/select2.js';
require('expose-loader?select2!select2');

import { enableProdMode } from '@angular/core';
if (PRODUCTION) enableProdMode();

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CdeAppModule } from '_app/app.module';
platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/);