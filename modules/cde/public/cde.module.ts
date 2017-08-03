import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from "ng2-select2";

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { BoardModule } from 'board/public/board.module';
import { DiscussModule } from 'discuss/discuss.module';
import { FormModule } from 'form/public/form.module';
import { SearchModule } from 'search/index';
import { SystemModule } from 'system/public/system.module';
import { WidgetModule } from 'widget/widget.module';

import { BoardCdeSummaryListComponent } from "./components/searchResults/boardCdeSummaryList.component";
import { BoardCdeSummaryListContentComponent } from "./components/searchResults/boardCdeSummaryListContent.component";
import { CdeGeneralDetailsComponent } from "./components/summary/cdeGeneralDetails.component";
import { CdeSummaryListComponent } from "./components/searchResults/cdeSummaryList.component";
import { CdeSummaryListContentComponent } from "./components/searchResults/cdeSummaryListContent.component";
import { CdeAccordionListNg2Component } from "./components/cdeAccordionListNg2.component";
import { ConceptsComponent } from "./components/concepts.component";
import { CreateDataElementComponent } from "./components/createDataElement.component";
import { DatasetsComponent } from "./components/datasets/datasets.component";
import { DerivationRulesComponent } from "./components/derivationRules.component";
import { DeGeneralDetailsComponent } from "./components/deGeneralDetails/deGeneralDetails.component";
import { MoreLikeThisComponent } from "./components/mlt/moreLikeThis.component";
import { PermissibleValueComponent } from "./components/permissibleValue.component";
import { RegistrationValidatorService } from "./components/validationRules/registrationValidator.service";
import { ValidRulesComponent } from "./components/validationRules/validRules.component";
import { ValueDomainSummaryComponent } from "./components/summary/valueDomainSummary.component";
import { DataElementService } from "./dataElement.service";
import { DataElementViewComponent } from "./components/dataElementView.component";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";
import { KeysPipe } from 'core/public/KeysPipe';

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
        TreeModule,
        SystemModule,
        DiscussModule
    ],
    declarations: [
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
        CdeGeneralDetailsComponent,
        CdeSummaryListComponent,
        CdeSummaryListContentComponent,
        CreateDataElementComponent,
        CdeAccordionListNg2Component,
        ConceptsComponent,
        DerivationRulesComponent,
        DatasetsComponent,
        DeGeneralDetailsComponent,
        DataElementViewComponent,
        MoreLikeThisComponent,
        ValidRulesComponent,
        ValueDomainSummaryComponent,
        PermissibleValueComponent,
        KeysPipe
    ],
    entryComponents: [
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
        CdeSummaryListComponent,
        CdeSummaryListContentComponent,
        CdeAccordionListNg2Component,
        CreateDataElementComponent,
        DataElementViewComponent
    ],
    exports: [],
    providers: [
        RegistrationValidatorService,
        DataElementService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeModule {
}
