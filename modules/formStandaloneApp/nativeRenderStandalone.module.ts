import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { NativeRenderStandaloneComponent } from './nativeRenderStandalone.component';


@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpModule,
        // internal
        NativeRenderModule,
    ],
    declarations: [
        NativeRenderStandaloneComponent,
    ],
    entryComponents: [
        NativeRenderStandaloneComponent,
    ],
    exports: [
    ],
    providers: [
    ],
    bootstrap: [NativeRenderStandaloneComponent]
})
export class NativeRenderStandaloneModule {
}
