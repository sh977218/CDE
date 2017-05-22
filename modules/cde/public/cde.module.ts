import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AdminItemModule } from "../../adminItem/public/adminItem.module";
import { BoardModule } from "../../board/public/board.module";
import { ConceptsComponent } from "./components/concepts.component";
import { DerivationRulesComponent } from "./components/derivationRules.component";
import { DatasetsComponent } from "./components/datasets/datasets.component";
import { MoreLikeThisComponent } from "./components/mlt/moreLikeThis.component";
import { CdeGeneralDetailsComponent } from "./components/summary/cdeGeneralDetails.component";
import { ValueDomainSummaryComponent } from "./components/summary/valueDomainSummary.component";
import { CdeSummaryListComponent } from "./components/summary/cdeSummaryList.component";
import { DeGeneralDetailsComponent } from "./components/deGeneralDetails/deGeneralDetails.component";
import { SystemModule } from "../../system/public/system.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        AdminItemModule,
        BoardModule,
        SystemModule
    ],
    declarations: [
        ConceptsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        MoreLikeThisComponent,
        CdeGeneralDetailsComponent,
        ValueDomainSummaryComponent,
        CdeSummaryListComponent,
        DeGeneralDetailsComponent
    ],
    entryComponents: [
        ConceptsComponent,
        DeGeneralDetailsComponent,
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
