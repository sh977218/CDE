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
import { PermissibleValueComponent } from "./components/permissibleValue.component";
import { KeysPipe } from "./components/KeysPipe";
import { SystemModule } from "../../system/public/system.module";
import { Select2Module } from "ng2-select2";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        Select2Module,
        AdminItemModule,
        BoardModule,
        SystemModule
    ],
    declarations: [
        KeysPipe,
        ConceptsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        MoreLikeThisComponent,
        CdeGeneralDetailsComponent,
        ValueDomainSummaryComponent,
        CdeSummaryListComponent,
        DeGeneralDetailsComponent,
        PermissibleValueComponent,
    ],
    entryComponents: [
        ConceptsComponent,
        DeGeneralDetailsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        MoreLikeThisComponent,
        CdeGeneralDetailsComponent,
        ValueDomainSummaryComponent,
        PermissibleValueComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CdeModule {
}
