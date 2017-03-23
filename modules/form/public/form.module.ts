import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { PaginationModule } from "ng2-bootstrap";
import { ModalModule } from "ng2-bootstrap";

import { NativeRenderFullComponent } from "./nativeRender/nativeRenderFull.component";
import { NativeRenderComponent } from "./nativeRender/nativeRender.component";
import { NativeSectionComponent } from "./nativeRender/nativeSection.component";
import { NativeSectionMatrixComponent } from "./nativeRender/nativeSectionMatrix.component";
import { NativeQuestionComponent } from "./nativeRender/nativeQuestion.component";
import { NativeTableComponent } from "./nativeRender/nativeTable.component";

@NgModule({
    declarations: [
        NativeRenderFullComponent,
        NativeRenderComponent,
        NativeSectionComponent,
        NativeSectionMatrixComponent,
        NativeQuestionComponent,
        NativeTableComponent
    ],
    imports: [CommonModule, FormsModule, NgbModule, ModalModule.forRoot(), PaginationModule.forRoot()],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormModule {
}
