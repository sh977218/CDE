import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from "ng2-select2";

import { AdminItemModule } from "../../adminItem/public/adminItem.module";
import { BoardModule } from "../../board/public/board.module";
import { FormModule } from "../../form/public/form.module";
import { SearchModule } from "search";
import { WidgetModule } from "../../widget/widget.module";

import { BoardCdeSummaryListComponent } from "./components/searchResults/boardCdeSummaryList.component";
import { BoardCdeSummaryListContentComponent } from "./components/searchResults/boardCdeSummaryListContent.component";
import { CdeGeneralDetailsComponent } from "./components/summary/cdeGeneralDetails.component";
import { CdeSummaryListComponent } from "./components/searchResults/cdeSummaryList.component";
import { CdeSummaryListContentComponent } from "./components/searchResults/cdeSummaryListContent.component";
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
        CommonModule,
        FormsModule,
        NgbModule,
        Select2Module,
        // internal
        AdminItemModule,
        BoardModule,
        FormModule,
        SearchModule,
        WidgetModule,
    ],
    declarations: [
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
        CdeGeneralDetailsComponent,
        CdeSummaryListComponent,
        CdeSummaryListContentComponent,
        ConceptsComponent,
        DeGeneralDetailsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        KeysPipe,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        ValidRulesComponent,
        ValueDomainSummaryComponent,
        CdeSummaryListComponent,
        DeGeneralDetailsComponent,
        PermissibleValueComponent,
    ],
    entryComponents: [
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
        CdeGeneralDetailsComponent,
        CdeSummaryListComponent,
        CdeSummaryListContentComponent,
        ConceptsComponent,
        DatasetsComponent,
        DeGeneralDetailsComponent,
        DerivationRulesComponent,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        ValidRulesComponent,
        ValueDomainSummaryComponent,
        PermissibleValueComponent,
    ],
    exports: [
    ],
    providers: [
        RegistrationValidatorService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeModule {
}