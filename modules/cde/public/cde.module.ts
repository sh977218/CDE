import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from "ng2-select2";

import { AdminItemModule } from "adminItem/public/adminItem.module";
import { BoardModule } from "board/public/board.module";
import { SearchModule } from "search/search.module";
import { WidgetModule } from "widget/widget.module";

import { BoardCdeSummaryListComponent } from "./components/listView/boardCdeSummaryList.component";
import { BoardCdeSummaryListContentComponent } from "./components/listView/boardCdeSummaryListContent.component";
import { CdeAccordionListComponent } from "./components/listView/cdeAccordionList.component";
import { CdeGeneralDetailsComponent } from "./components/summary/cdeGeneralDetails.component";
import { CdeSearchComponent } from "./components/search/cdeSearch.component";
import { CdeSummaryListContentComponent } from "./components/listView/cdeSummaryListContent.component";
import { ConceptsComponent } from "./components/concepts.component";
import { DatasetsComponent } from "./components/datasets/datasets.component";
import { DerivationRulesComponent } from "./components/derivationRules.component";
import { DeGeneralDetailsComponent } from "./components/deGeneralDetails/deGeneralDetails.component";
import { MoreLikeThisComponent } from "./components/mlt/moreLikeThis.component";
import { PermissibleValueComponent } from "./components/permissibleValue.component";
import { QuickBoardCdeSummaryListContentComponent } from 'cde/public/components/listView/quickBoardCdeSummaryListContent.component';
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
        SearchModule,
        WidgetModule,
    ],
    declarations: [
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
        CdeAccordionListComponent,
        CdeGeneralDetailsComponent,
        CdeSearchComponent,
        CdeSummaryListContentComponent,
        ConceptsComponent,
        DeGeneralDetailsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        QuickBoardCdeSummaryListContentComponent,
        ValidRulesComponent,
        ValueDomainSummaryComponent,
    ],
    entryComponents: [
        CdeAccordionListComponent,
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
        CdeGeneralDetailsComponent,
        CdeSearchComponent,
        CdeSummaryListContentComponent,
        ConceptsComponent,
        DatasetsComponent,
        DeGeneralDetailsComponent,
        DerivationRulesComponent,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        QuickBoardCdeSummaryListContentComponent,
        ValidRulesComponent,
        ValueDomainSummaryComponent,
    ],
    exports: [
        CdeAccordionListComponent,
        CdeSearchComponent,
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeModule {
}
