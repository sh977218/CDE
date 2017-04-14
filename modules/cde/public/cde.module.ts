import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AdminModule } from "../../admin/public/admin.module";
import { BoardModule } from "../../board/public/board.module";
import { ConceptsComponent } from "./components/concepts.component";
import { DerivationRulesComponent } from "./components/derivationRules.component";
import { DatasetsComponent } from "./components/datasets/datasets.component";
import { MoreLikeThisComponent } from "./components/mlt/moreLikeThis.component";
import { CdeGeneralDetailsComponent } from "./components/summary/cdeGeneralDetails.component";
import { ValueDomainSummaryComponent } from "./components/summary/valueDomainSummary.component";
import { CdeSummaryListComponent } from "./components/summary/cdeSummaryList.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        AdminModule,
        BoardModule
    ],
    declarations: [
        ConceptsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        MoreLikeThisComponent,
        CdeGeneralDetailsComponent,
        ValueDomainSummaryComponent,
        CdeSummaryListComponent
    ],
    entryComponents: [
        ConceptsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        MoreLikeThisComponent,
        CdeGeneralDetailsComponent,
        ValueDomainSummaryComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CdeModule {
}
