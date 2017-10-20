import "zone.js";
import "../node_modules/zone.js/dist/long-stack-trace-zone.js";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.min.js";

// reflect-metadata needed before enableProdMode for IE
import "reflect-metadata";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

// required for ng2-select2
require('expose-loader?select2!select2');

require('expose-loader?bootstrap!bootstrap');

import { enableProdMode } from "@angular/core";
import { CdeAppModule } from '_app/app.module';

// path to node_modules required to override module/components/bootstrap
import "../node_modules/bootstrap/dist/css/bootstrap.css";

if (PRODUCTION)
    enableProdMode();

platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/);
