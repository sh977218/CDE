import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';

import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { NativeRenderStandaloneComponent } from './nativeRenderStandalone.component';
import { CdeAmericanDateParserFormatter } from 'nativeRender/americanDateParserFormatter';

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
        {provide: NgbDateParserFormatter, useClass: CdeAmericanDateParserFormatter},
    ],
    bootstrap: [NativeRenderStandaloneComponent]
})
export class NativeRenderStandaloneModule {
}
