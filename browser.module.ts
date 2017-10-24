// ./src/browser.module.ts
import { NgModule } from '@angular/core';
import { UniversalModule } from 'angular2-universal/browser';
import { AppModule } from './app/app.module’;
import { AppComponent } from './app/app.component';

export const isBrowser = true;
export const isNode = false;
export const APP_PROVIDERS = [
    {provide: 'isBrowser', useValue: isBrowser},
    {provide: 'isNode', useValue: isNode}
];

@NgModule({
    bootstrap: [AppComponent],
    imports: [
        UniversalModule,
        AppModule
    ],
    providers: [
        ...APP_PROVIDERS
    ]
})
export class MainModule {}