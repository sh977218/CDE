import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterModule } from '@angular/router';
import { Select2Module } from "ng2-select2";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";

import { AdminItemModule } from "adminItem/public/adminItem.module";
import { BoardModule } from "board/public/board.module";
import { CdeAccordionListComponent } from 'cde/public/components/listView/cdeAccordionList.component';
import { CdeGeneralDetailsComponent } from "cde/public/components/summary/cdeGeneralDetails.component";
import { CreateDataElementComponent } from 'cde/public/components/createDataElement.component';
import { DiscussModule } from 'discuss/discuss.module';
import { SearchModule } from 'search/search.module';
import { ValueDomainSummaryComponent } from "cde/public/components/summary/valueDomainSummary.component";
import { WidgetModule } from "widget/widget.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule,
        Select2Module,
        TreeModule,
        // core
        WidgetModule,
        // internal
        AdminItemModule,
        BoardModule,
        DiscussModule,
        SearchModule,
    ],
    declarations: [
        CdeAccordionListComponent,
        CdeGeneralDetailsComponent,
        CreateDataElementComponent,
        ValueDomainSummaryComponent,
    ],
    entryComponents: [
        CdeAccordionListComponent,
    ],
    exports: [
        CdeGeneralDetailsComponent,
        CreateDataElementComponent,
        ValueDomainSummaryComponent,
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeModule {
}
