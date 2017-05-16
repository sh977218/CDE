import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TreeModule } from "angular-tree-component";
import { Select2Module } from "ng2-select2";
import { SortableModule } from "ngx-bootstrap";

import { AdminItemModule } from "../../adminItem/public/adminItem.module";

import { ArrayListPipe } from "./arrayList.pipe";
import { CdeSortableComponent } from "./components/mergeForm/cdeSortable.component";
import { FormDescriptionComponent } from "./tabs/description/formDescription.component";
import { FormDescriptionQuestionComponent } from "./tabs/description/formDescriptionQuestion.component";
import { FormDescriptionQuestionDetailComponent } from "./tabs/description/formDescriptionQuestionDetail.component";
import { FormDescriptionSectionComponent } from "./tabs/description/formDescriptionSection.component";
import { FormSearchDirective, QuestionSearchDirective } from "./upgrade-components";
import { MergeFormComponent } from "./components/mergeForm/mergeForm.component";
import { NativeRenderFullComponent } from "./nativeRender/nativeRenderFull.component";
import { NativeRenderComponent } from "./nativeRender/nativeRender.component";
import { NativeSectionComponent } from "./nativeRender/nativeSection.component";
import { NativeSectionMatrixComponent } from "./nativeRender/nativeSectionMatrix.component";
import { NativeQuestionComponent } from "./nativeRender/nativeQuestion.component";
import { NativeTableComponent } from "./nativeRender/nativeTable.component";

import { FormService } from "./form.service";
import { SkipLogicService } from "./skipLogic.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        Select2Module,
        SortableModule.forRoot(),
        TreeModule,
        // internal
        AdminItemModule
    ],
    declarations: [
        ArrayListPipe,
        CdeSortableComponent,
        FormDescriptionComponent,
        FormDescriptionQuestionComponent,
        FormDescriptionQuestionDetailComponent,
        FormDescriptionSectionComponent,
        FormSearchDirective,
        MergeFormComponent,
        NativeRenderFullComponent,
        NativeRenderComponent,
        NativeSectionComponent,
        NativeSectionMatrixComponent,
        NativeQuestionComponent,
        NativeTableComponent,
        QuestionSearchDirective
    ],
    entryComponents: [
        FormDescriptionComponent,
        MergeFormComponent,
        NativeRenderFullComponent,
        NativeRenderComponent,
    ],
    providers: [
        FormService,
        SkipLogicService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormModule {
}
