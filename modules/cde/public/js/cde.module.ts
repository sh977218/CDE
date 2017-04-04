import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { upgradeAdapter } from "../../../upgrade";
import { ConceptsComponent } from "../components/concepts.component";
import { DerivationRulesComponent } from "../components/derivationRules.component";
import { DatasetsComponent } from "../components/datasets/datasets.component";

@NgModule({
    declarations: [
        upgradeAdapter.upgradeNg1Component("sortableArray"),
        ConceptsComponent,
        DerivationRulesComponent,
        DatasetsComponent
        ],
    providers: [],
    imports: [CommonModule, FormsModule, NgbModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CdeModule {
}
