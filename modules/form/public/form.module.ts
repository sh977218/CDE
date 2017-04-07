import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { PaginationModule, AlertModule, ModalModule, SortableModule, ProgressbarModule } from "ng2-bootstrap";

import { AdminModule } from "../../admin/public/admin.module";
import { MergeFormComponent } from "./components/mergeForm/mergeForm.component";
import { NativeRenderFullComponent } from "./nativeRender/nativeRenderFull.component";
import { NativeRenderComponent } from "./nativeRender/nativeRender.component";
import { NativeSectionComponent } from "./nativeRender/nativeSection.component";
import { NativeSectionMatrixComponent } from "./nativeRender/nativeSectionMatrix.component";
import { NativeQuestionComponent } from "./nativeRender/nativeQuestion.component";
import { NativeTableComponent } from "./nativeRender/nativeTable.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        SortableModule.forRoot(),
        AlertModule.forRoot(),
        ProgressbarModule.forRoot(),
        AdminModule
    ],
    declarations: [
        MergeFormComponent,
        NativeRenderFullComponent,
        NativeRenderComponent,
        NativeSectionComponent,
        NativeSectionMatrixComponent,
        NativeQuestionComponent,
        NativeTableComponent
    ],
    entryComponents: [
        NativeRenderFullComponent,
        NativeRenderComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormModule {
}
