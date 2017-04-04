import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PaginationModule } from "ng2-bootstrap";
import { ModalModule } from "ng2-bootstrap";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { upgradeAdapter } from "../../../upgrade";
import { ConceptsComponent } from "../components/concepts.component";
import { DerivationRulesComponent } from "../components/derivationRules.component";
import { DatasetsComponent } from "../components/datasets/datasets.component";
import { MoreLikeThisComponent } from "../components/mlt/moreLikeThis.component";
import { CdeGeneralDetailsComponent } from "../components/summary/cdeGeneralDetails.component";
import { ValueDomainSummaryComponent } from "../components/summary/valueDomainSummary.component";
import { CdeSummaryListComponent } from "../components/summary/cdeSummaryList.component";

@NgModule({
    declarations: [
        upgradeAdapter.upgradeNg1Component("sortableArray"),
        ConceptsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        MoreLikeThisComponent,
        CdeGeneralDetailsComponent,
        ValueDomainSummaryComponent,
        CdeSummaryListComponent
        ],
    providers: [],
    imports: [CommonModule, FormsModule, NgbModule, ModalModule.forRoot(), PaginationModule.forRoot()],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CdeModule {
}
