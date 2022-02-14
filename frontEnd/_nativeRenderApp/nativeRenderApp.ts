import 'zone.js';
// reflect-metadata needed before enableProdMode for IE
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';
if (PRODUCTION) {
    enableProdMode();
}

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NativeRenderAppModule } from './nativeRenderApp.module';
platformBrowserDynamic().bootstrapModule(NativeRenderAppModule);

import '../../modules/common.scss';
