import "core-js/client/shim";
import "zone.js";
import "../node_modules/zone.js/dist/long-stack-trace-zone.js";
import "reflect-metadata";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { CdeAppModule } from "./app.module";
import { upgradeAdapter } from "./upgrade";

import "./upgrade-imports";

platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/);
upgradeAdapter.bootstrap(document.body, ["cdeAppModule"], {strictDi: true});
