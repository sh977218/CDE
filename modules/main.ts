import "zone.js";
// import "../node_modules/zone.js/dist/long-stack-trace-zone.js"; // TODO: dev only
// reflect-metadata needed before enableProdMode for IE
import "reflect-metadata";

// path to node_modules required to override module/components/bootstrap
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.min.js";
// require('expose-loader?bootstrap!bootstrap');
import 'rxjs/Rx';
// required for ng2-select2
import "../node_modules/select2/dist/js/select2.js";
require('expose-loader?select2!select2');

import { enableProdMode } from "@angular/core";
if (PRODUCTION)
    enableProdMode();

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { CdeAppModule } from '_app/app.module';
platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/);
