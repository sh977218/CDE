import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';

import { environment } from 'environments/environment';
import { CdeAppComponent } from '_app/app.component';
import { appConfig } from '_app/src/app.config';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(CdeAppComponent, appConfig).catch(err => console.error(err));
