import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from "ng2-select2";

import { AdminItemModule } from "../../adminItem/public/adminItem.module";
import { BoardModule } from "../../board/public/board.module";
import { SystemModule } from "../../system/public/system.module";

import { CdeGeneralDetailsComponent } from "./components/summary/cdeGeneralDetails.component";
import { CdeSummaryListComponent } from "./components/summary/cdeSummaryList.component";
import { ConceptsComponent } from "./components/concepts.component";
import { DatasetsComponent } from "./components/datasets/datasets.component";
import { DerivationRulesComponent } from "./components/derivationRules.component";
import { DeGeneralDetailsComponent } from "./components/deGeneralDetails/deGeneralDetails.component";
import { KeysPipe } from "../../core/public/KeysPipe";
import { MoreLikeThisComponent } from "./components/mlt/moreLikeThis.component";
import { PermissibleValueComponent } from "./components/permissibleValue.component";
import { RegistrationValidatorService } from "./components/validationRules/registrationValidator.service";
import { ValidRulesComponent } from "./components/validationRules/validRules.component";
import { ValueDomainSummaryComponent } from "./components/summary/valueDomainSummary.component";

@NgModule({
    imports: [
        AdminItemModule,
        BoardModule,
        CommonModule,
        FormsModule,
        NgbModule,
        Select2Module,
        SystemModule,
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
        ValidRulesComponent,
        ValueDomainSummaryComponent,
    ],
    entryComponents: [
        CdeGeneralDetailsComponent,
        ConceptsComponent,
        DatasetsComponent,
        DeGeneralDetailsComponent,
        DerivationRulesComponent,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        ValidRulesComponent,
        ValueDomainSummaryComponent,
    ],
    providers: [
        RegistrationValidatorService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CdeModule {
}
