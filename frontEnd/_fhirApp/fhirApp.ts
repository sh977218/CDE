import 'zone.js';
// reflect-metadata needed before enableProdMode for IE
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';
if (PRODUCTION) {
    enableProdMode();
}

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FhirAppModule } from './fhirApp.module';
platformBrowserDynamic().bootstrapModule(FhirAppModule);

// must be after bootstrap to overload material styles
import '../../modules/_app/app.scss';
