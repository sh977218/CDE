import "zone.js";
import "../node_modules/zone.js/dist/long-stack-trace-zone.js";
// reflect-metadata needed before enableProdMode for IE
import "reflect-metadata";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { UpgradeModule } from "@angular/upgrade/static";
import { CdeAppModule } from "./app.module";

import "./upgrade-imports";

// required for ng2-select2
require('expose-loader?select2!select2');

import { enableProdMode } from "@angular/core";
if (PRODUCTION)
    enableProdMode();

platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/).then(platformRef => {
    const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
    upgrade.bootstrap(document.body, ["cdeAppModule"], {strictDi: true});
});
