import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PaginationModule } from "ng2-bootstrap";
import { ModalModule } from "ng2-bootstrap";

import { upgradeAdapter } from "../../../upgrade";
import { ConceptsComponent } from "../components/concepts.component";
import { DerivationRulesComponent } from "../components/derivationRules.component";
import { LinkedFormsComponent } from "../components/linkedForms.component";

@NgModule({
    declarations: [
        upgradeAdapter.upgradeNg1Component("sortableArray"),
        upgradeAdapter.upgradeNg1Component("formSummaryList"),
        ConceptsComponent,
        LinkedFormsComponent,
        DerivationRulesComponent
        ],
    providers: [],
    imports: [CommonModule, FormsModule, ModalModule.forRoot(), PaginationModule.forRoot()],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CdeModule {
}
