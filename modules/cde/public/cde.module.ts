import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";
import { Select2Module } from "ng2-select2";

import { AdminItemModule } from "adminItem/public/adminItem.module";
import { BoardModule } from "board/public/board.module";
import { CdeGeneralDetailsComponent } from "cde/public/components/summary/cdeGeneralDetails.component";
import { CreateDataElementComponent } from 'cde/public/components/createDataElement.component';
import { DiscussModule } from 'discuss/discuss.module';
import { ValueDomainSummaryComponent } from "cde/public/components/summary/valueDomainSummary.component";
import { WidgetModule } from "widget/widget.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        Select2Module,
        TreeModule,
        // core
        WidgetModule,
        // internal
        AdminItemModule,
        BoardModule,
        DiscussModule,
    ],
    declarations: [
        CdeGeneralDetailsComponent,
        CreateDataElementComponent,
        ValueDomainSummaryComponent,
    ],
    entryComponents: [
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
