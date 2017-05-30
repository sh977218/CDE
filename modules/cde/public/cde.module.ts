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
import { PermissibleValueComponent } from "./components/permissibleValue.component";
import { KeysPipe } from "./components/KeysPipe";
import { Select2Module } from "ng2-select2";

@NgModule({
    imports: [
        AdminItemModule,
        BoardModule,
        CommonModule,
        FormsModule,
        NgbModule,
        Select2Module,
        SystemModule
    ],
    declarations: [
        CdeGeneralDetailsComponent,
        CdeSummaryListComponent,
        ConceptsComponent,
        DeGeneralDetailsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        KeysPipe,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        ValueDomainSummaryComponent,
        CdeSummaryListComponent,
        DeGeneralDetailsComponent,
        PermissibleValueComponent,
    ],
    entryComponents: [
        CdeGeneralDetailsComponent,
        ConceptsComponent,
        DatasetsComponent,
        DeGeneralDetailsComponent,
        DerivationRulesComponent,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        ValueDomainSummaryComponent,
        PermissibleValueComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CdeModule {
}
