import "zone.js";
import "../../node_modules/zone.js/dist/long-stack-trace-zone.js";
// reflect-metadata needed before enableProdMode for IE
import "reflect-metadata";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { NativeRenderStandaloneModule } from "./nativeRenderStandalone.module";

import { enableProdMode } from "@angular/core";
if (PRODUCTION)
    enableProdMode();

platformBrowserDynamic().bootstrapModule(NativeRenderStandaloneModule);
