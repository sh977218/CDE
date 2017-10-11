import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from "ng2-select2";

import { AdminItemModule } from "adminItem/public/adminItem.module";
import { BoardModule } from "board/public/board.module";
import { DiscussModule } from 'discuss/discuss.module';
import { SearchModule } from "search/search.module";
import { WidgetModule } from "widget/widget.module";

import { BoardCdeSummaryListComponent } from "./components/listView/boardCdeSummaryList.component";
import { BoardCdeSummaryListContentComponent } from "./components/listView/boardCdeSummaryListContent.component";
import { CdeAccordionListComponent } from "./components/listView/cdeAccordionList.component";
import { CdeGeneralDetailsComponent } from "./components/summary/cdeGeneralDetails.component";
import { CdeSearchComponent } from "./components/search/cdeSearch.component";
import { CdeSummaryListContentComponent } from "./components/listView/cdeSummaryListContent.component";
import { CdeAccordionListNg2Component } from "./components/cdeAccordionListNg2.component";
import { ConceptsComponent } from "./components/concepts.component";
import { CreateDataElementComponent } from "./components/createDataElement.component";
import { DatasetsComponent } from "./components/datasets/datasets.component";
import { DerivationRulesComponent } from "./components/derivationRules.component";
import { DeGeneralDetailsComponent } from "./components/deGeneralDetails/deGeneralDetails.component";
import { MoreLikeThisComponent } from "./components/mlt/moreLikeThis.component";
import { PermissibleValueComponent } from "./components/permissibleValue.component";
import { QuickBoardCdeSummaryListContentComponent } from 'cde/public/components/listView/quickBoardCdeSummaryListContent.component';
import { ValidRulesComponent } from "./components/validationRules/validRules.component";
import { ValueDomainSummaryComponent } from "./components/summary/valueDomainSummary.component";
import { SdcViewComponent } from "./components/sdcView/sdcView.component";
import { DataElementService } from "./dataElement.service";
import { DataElementViewComponent } from "./components/dataElementView.component";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";
import { CdeStatusReportComponent } from "./components/statusReport/cdeStatusReport.component";
import { CdeClassificationComponent } from "./components/cdeClassification/cdeClassification.component";
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
    {path: 'cde/search', component: CdeSearchComponent},
    {path: 'createCde', component: CreateDataElementComponent},
    {path: 'deView', component: DataElementViewComponent},
    {path: 'sdcview', component: SdcViewComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        Select2Module,
        TreeModule,
        // internal
        AdminItemModule,
        BoardModule,
        DiscussModule,
        SearchModule,
        WidgetModule,
        RouterModule.forChild(appRoutes)
    ],
    declarations: [
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
        CdeAccordionListComponent,
        CdeClassificationComponent,
        CdeGeneralDetailsComponent,
        CdeSearchComponent,
        CdeStatusReportComponent,
        CdeSummaryListContentComponent,
        CreateDataElementComponent,
        CdeAccordionListNg2Component,
        ConceptsComponent,
        DataElementViewComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        DeGeneralDetailsComponent,
        DataElementViewComponent,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        QuickBoardCdeSummaryListContentComponent,
        SdcViewComponent,
        ValidRulesComponent,
        ValueDomainSummaryComponent,
    ],
    entryComponents: [
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
        CdeAccordionListComponent,
        CdeAccordionListNg2Component,
        CdeGeneralDetailsComponent,
        CdeSearchComponent,
        CdeStatusReportComponent,
        CdeSummaryListContentComponent,
        ConceptsComponent,
        CreateDataElementComponent,
        DataElementViewComponent,
        DatasetsComponent,
        DeGeneralDetailsComponent,
        DerivationRulesComponent,
        MoreLikeThisComponent,
        PermissibleValueComponent,
        QuickBoardCdeSummaryListContentComponent,
        SdcViewComponent,
        ValidRulesComponent,
        ValueDomainSummaryComponent,
    ],
    exports: [
        CdeAccordionListComponent,
        CdeSearchComponent,
    ],
    providers: [
        DataElementService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeModule {
}
