import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbDatepickerModule, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module";
import { NgbTimepickerModule } from "@ng-bootstrap/ng-bootstrap/timepicker/timepicker.module";

import { CdeAmericanDateParserFormatter } from 'nativeRender/americanDateParserFormatter';
import { FormService } from 'nativeRender/form.service';
import { NativeRenderComponent } from 'nativeRender/nativeRender.component';
import { NativeSectionComponent } from 'nativeRender/nativeSection.component';
import { NativeSectionMatrixComponent } from 'nativeRender/nativeSectionMatrix.component';
import { NativeQuestionComponent } from 'nativeRender/nativeQuestion.component';
import { NativeTableComponent } from 'nativeRender/nativeTable.component';
import { SkipLogicService } from 'nativeRender/skipLogic.service';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbDatepickerModule,
        NgbTimepickerModule,
        // internal
    ],
    declarations: [
        NativeRenderComponent,
        NativeSectionComponent,
        NativeSectionMatrixComponent,
        NativeQuestionComponent,
        NativeTableComponent,
    ],
    entryComponents: [
        NativeRenderComponent,
    ],
    exports: [
        NativeRenderComponent,
    ],
    providers: [
        {provide: NgbDateParserFormatter, useClass: CdeAmericanDateParserFormatter},
        FormService,
        SkipLogicService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NativeRenderModule {
}
