import "core-js/client/shim";
import "zone.js";
import "../node_modules/zone.js/dist/long-stack-trace-zone.js";
import "reflect-metadata";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { UpgradeModule } from "@angular/upgrade/static";
import { CdeAppModule } from "./app.module";

import "./upgrade-imports";

platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/).then(platformRef => {
    const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
    upgrade.bootstrap(document.body, ["cdeAppModule"], {strictDi: true});
});
