import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PaginationModule } from "ng2-bootstrap";
import { ModalModule } from "ng2-bootstrap";

import { upgradeAdapter } from "../../upgrade";
import {IdentifyQuestionsComponent} from "./formMerge/identifyQuestions.component";


@NgModule({
    declarations: [
        IdentifyQuestionsComponent
    ],
    providers: [],
    imports: [CommonModule, FormsModule, ModalModule.forRoot(), PaginationModule.forRoot()],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormModule {
}
