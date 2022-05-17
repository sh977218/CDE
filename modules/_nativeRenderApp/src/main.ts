import { enableProdMode } from '@angular/core';
import { environment } from 'environments/environment';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NativeRenderAppModule } from './nativeRenderApp.module';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(NativeRenderAppModule).catch(err => console.error(err));
