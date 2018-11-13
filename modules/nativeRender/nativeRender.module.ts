import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { CommonAppModule } from '_commonApp/commonApp.module';
import { FormService } from 'nativeRender/form.service';
import { NativeMetadataComponent } from 'nativeRender/nativeMetadata.component';
import { NativeRenderComponent } from 'nativeRender/nativeRender.component';
import { NativeSectionComponent } from 'nativeRender/nativeSection.component';
import { NativeSectionMatrixComponent } from 'nativeRender/nativeSectionMatrix.component';
import { NativeQuestionComponent } from 'nativeRender/nativeQuestion.component';
import { NativeTableComponent } from 'nativeRender/nativeTable.component';
import { SkipLogicService } from 'nativeRender/skipLogic.service';
import { ScoreService } from 'nativeRender/score.service';
import { MatIconModule } from '@angular/material';
import { AlertModule } from 'alert/alert.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        // core
        // no WidgetModule,
        // internal
        AlertModule,
        MatIconModule,
    ],
    declarations: [
        NativeMetadataComponent,
        NativeRenderComponent,
        NativeQuestionComponent,
        NativeSectionComponent,
        NativeSectionMatrixComponent,
        NativeTableComponent,
    ],
    entryComponents: [
        NativeRenderComponent,
    ],
    exports: [
        NativeRenderComponent,
    ],
    providers: [
        FormService,
        SkipLogicService,
        ScoreService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NativeRenderModule {
}
