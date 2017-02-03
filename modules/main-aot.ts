import "core-js/client/shim";
import "zone.js";
import "reflect-metadata";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {enableProdMode} from "@angular/core";
enableProdMode();

import {CdeAppModule} from "./app.module";
import {upgradeAdapter} from "./upgrade";

require("./upgrade-imports");

platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/);
upgradeAdapter.bootstrap(document.body, ["cdeAppModule"], {strictDi: true});
