import 'zone.js';
if (!PRODUCTION) require('../../node_modules/zone.js/dist/long-stack-trace-zone.js');
// reflect-metadata needed before enableProdMode for IE
import 'reflect-metadata';

// path to node_modules required to override module/components/bootstrap
import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import '../../node_modules/bootstrap/dist/js/bootstrap.js';
require('expose-loader?bootstrap!bootstrap');

import { enableProdMode } from '@angular/core';
if (PRODUCTION) enableProdMode();

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NativeRenderAppModule } from '_nativeRenderApp/nativeRenderApp.module';
platformBrowserDynamic().bootstrapModule(NativeRenderAppModule);

// must be after bootstrap to overload material styles
import '../common.scss';
