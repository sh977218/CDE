import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PaginationModule, AlertModule, ModalModule, SortableModule, ProgressbarModule } from "ng2-bootstrap";

import { MergeFormComponent } from "./components/mergeForm/mergeForm.component";

@NgModule({
    declarations: [
        MergeFormComponent
    ],
    providers: [],
    imports: [CommonModule, FormsModule, ModalModule.forRoot(), PaginationModule.forRoot(), SortableModule.forRoot(), AlertModule.forRoot(), ProgressbarModule.forRoot()],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormModule {
}
