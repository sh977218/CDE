import 'zone.js';
if (!PRODUCTION) require('../../node_modules/zone.js/dist/long-stack-trace-zone.js');
// reflect-metadata needed before enableProdMode for IE
import 'reflect-metadata';

import 'font-awesome/css/font-awesome.css';

// path to node_modules required to override module/components/bootstrap
import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import '../../node_modules/bootstrap/dist/js/bootstrap.js';
import '../../node_modules/@angular/material/prebuilt-themes/indigo-pink.css';
require('expose-loader?bootstrap!bootstrap');

import { enableProdMode } from '@angular/core';
if (PRODUCTION) enableProdMode();

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FhirAppModule } from "./fhirApp.module";
platformBrowserDynamic().bootstrapModule(FhirAppModule);
