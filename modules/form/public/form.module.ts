import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TreeModule } from "angular-tree-component";
import { SortableModule } from "ng2-bootstrap/index";

import { AdminModule } from "../../admin/public/admin.module";

import { CdeSortableComponent } from "./components/mergeForm/cdeSortable.component";
import { FormDescriptionComponent } from "./tabs/description/formDescripton.component";
import { MergeFormComponent } from "./components/mergeForm/mergeForm.component";
import { NativeRenderFullComponent } from "./nativeRender/nativeRenderFull.component";
import { NativeRenderComponent } from "./nativeRender/nativeRender.component";
import { NativeSectionComponent } from "./nativeRender/nativeSection.component";
import { NativeSectionMatrixComponent } from "./nativeRender/nativeSectionMatrix.component";
import { NativeQuestionComponent } from "./nativeRender/nativeQuestion.component";
import { NativeTableComponent } from "./nativeRender/nativeTable.component";
import { FormDescriptionQuestionComponent } from "./tabs/description/formDescriptionQuestion.component";
import { FormDescriptionQuestionDetailComponent } from "./tabs/description/formDescriptionQuestionDetail.component";
import { FormDescriptionSectionComponent } from "./tabs/description/formDescriptionSection.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        SortableModule.forRoot(),
        TreeModule,
        AdminModule
    ],
    declarations: [
        MergeFormComponent,
        CdeSortableComponent,
        FormDescriptionComponent,
        FormDescriptionQuestionComponent,
        FormDescriptionQuestionDetailComponent,
        FormDescriptionSectionComponent,
        NativeRenderFullComponent,
        NativeRenderComponent,
        NativeSectionComponent,
        NativeSectionMatrixComponent,
        NativeQuestionComponent,
        NativeTableComponent
    ],
    entryComponents: [
        FormDescriptionComponent,
        MergeFormComponent,
        NativeRenderFullComponent,
        NativeRenderComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormModule {
}
