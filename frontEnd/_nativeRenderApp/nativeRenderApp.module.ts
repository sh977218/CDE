import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NativeRenderAppComponent } from './nativeRenderApp.component';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
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
