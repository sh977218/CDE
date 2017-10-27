import "zone.js";
// reflect-metadata needed before enableProdMode for IE
import "reflect-metadata";

import { enableProdMode } from "@angular/core";
if (PRODUCTION)
    enableProdMode();

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { NativeRenderStandaloneModule } from "./nativeRenderStandalone.module";
platformBrowserDynamic().bootstrapModule(NativeRenderStandaloneModule);
