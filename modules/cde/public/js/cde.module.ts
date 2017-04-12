import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ConceptsComponent } from "../components/concepts.component";
import { DerivationRulesComponent } from "../components/derivationRules.component";
import { DatasetsComponent } from "../components/datasets/datasets.component";
import { AdminItemModule } from "../../../adminItem/public/adminItem.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        AdminItemModule
    ],
    declarations: [
        ConceptsComponent,
        DerivationRulesComponent,
        DatasetsComponent
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CdeModule {
}
