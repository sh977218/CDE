// IE custom event polyfill
(function () {
    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        let evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = (<any>window).Event.prototype;

    (<any>window).CustomEvent = CustomEvent;
})();

import "core-js/client/shim";
import "zone.js";
import "../node_modules/zone.js/dist/long-stack-trace-zone.js";
import "reflect-metadata";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { UpgradeModule } from "@angular/upgrade/static";
import { CdeAppModule } from "./app.module";

import "./upgrade-imports";

import { enableProdMode } from "@angular/core";
if (PRODUCTION) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(CdeAppModule/*, options*/).then(platformRef => {
    const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
    upgrade.bootstrap(document.body, ["cdeAppModule"], {strictDi: true});
});
