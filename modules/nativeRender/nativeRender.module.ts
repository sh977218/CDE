import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NativeMetadataComponent } from 'nativeRender/nativeMetadata.component';
import { NativeRenderComponent } from 'nativeRender/nativeRender.component';
import { NativeSectionComponent } from 'nativeRender/nativeSection.component';
import { NativeSectionMatrixComponent } from 'nativeRender/nativeSectionMatrix.component';
import { NativeQuestionComponent } from 'nativeRender/nativeQuestion.component';
import { NativeTableComponent } from 'nativeRender/nativeTable.component';
import { SkipLogicService } from 'nativeRender/skipLogic.service';
import { ScoreService } from 'nativeRender/score.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
        // non-core no internal
    ],
    declarations: [
        NativeMetadataComponent,
        NativeRenderComponent,
        NativeQuestionComponent,
        NativeSectionComponent,
        NativeSectionMatrixComponent,
        NativeTableComponent,
    ],
    exports: [
        NativeRenderComponent,
    ],
    providers: [
        SkipLogicService,
        ScoreService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NativeRenderModule {
}
