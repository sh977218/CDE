import "zone.js";
import 'rxjs/Rx';

if (!PRODUCTION)
    require("../node_modules/zone.js/dist/long-stack-trace-zone.js");
// reflect-metadata needed before enableProdMode for IE
import "reflect-metadata";

import "../node_modules/font-awesome/css/font-awesome.css";

// path to node_modules required to override module/components/bootstrap
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "../node_modules/bootstrap/dist/js/bootstrap.js";
require('expose-loader?bootstrap!bootstrap');

/*
import "../node_modules/jquery/dist/jquery.js";
require('expose-loader?jquery!jquery');
require('expose-loader?$!jquery');
*/


// required for ng2-select2
import "../node_modules/select2/dist/js/select2.js";

require('expose-loader?select2!select2');

import { enableProdMode } from "@angular/core";

if (PRODUCTION)
    enableProdMode();

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { CdeAppModule } from '_app/app.module';

platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/);
