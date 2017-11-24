import "zone.js";
import "../../node_modules/zone.js/dist/long-stack-trace-zone.js";
// reflect-metadata needed before enableProdMode for IE
import "reflect-metadata";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import "font-awesome/css/font-awesome.css"
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../node_modules/bootstrap/dist/js/bootstrap.min.js";
require('expose-loader?bootstrap!bootstrap');

import { enableProdMode } from "@angular/core";
import { EmbedAppModule } from '_embedApp/embedApp.module';

if (PRODUCTION)
    enableProdMode();

platformBrowserDynamic().bootstrapModule(EmbedAppModule/*, options*/).then(() => {
});
