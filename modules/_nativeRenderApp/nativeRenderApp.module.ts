import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { NativeRenderAppComponent } from '_nativeRenderApp/nativeRenderApp.component';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
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
    exports: [],
    providers: [],
    bootstrap: [NativeRenderAppComponent]
})
export class NativeRenderAppModule {
}
