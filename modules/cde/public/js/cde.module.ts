import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PaginationModule } from "ng2-bootstrap";
import { ModalModule } from "ng2-bootstrap";

import { ConceptsComponent } from "../components/concepts.component";
import { DerivationRulesComponent } from "../components/derivationRules.component";
import { DatasetsComponent } from "../components/datasets/datasets.component";

@NgModule({
    declarations: [
        ConceptsComponent,
        DerivationRulesComponent,
        DatasetsComponent
        ],
    providers: [],
    imports: [CommonModule, FormsModule, ModalModule.forRoot(), PaginationModule.forRoot()],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CdeModule {
}
