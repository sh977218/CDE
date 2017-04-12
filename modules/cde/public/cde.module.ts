import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AdminModule } from "../../admin/public/admin.module";
import { ConceptsComponent } from "./components/concepts.component";
import { DerivationRulesComponent } from "./components/derivationRules.component";
import { DatasetsComponent } from "./components/datasets/datasets.component";
import { MoreLikeThisComponent } from "./components/moreLikeThis.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        AdminModule
    ],
    declarations: [
        ConceptsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        MoreLikeThisComponent
    ],
    entryComponents: [
        ConceptsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        MoreLikeThisComponent
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CdeModule {
}
