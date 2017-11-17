import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { NativeRenderAppComponent } from './nativeRenderApp.component';


@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpModule,
        // core
        // no WidgetModule,
        // internal
        NativeRenderModule,
    ],
    declarations: [
        NativeRenderAppComponent,
    ],
    entryComponents: [
        NativeRenderAppComponent,
    ],
    exports: [
    ],
    providers: [
    ],
    bootstrap: [NativeRenderAppComponent]
})
export class NativeRenderAppModule {
}
