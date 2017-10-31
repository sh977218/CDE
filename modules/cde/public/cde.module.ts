import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from "ng2-select2";

import { AdminItemModule } from "adminItem/public/adminItem.module";
import { BoardModule } from "board/public/board.module";
import { DiscussModule } from 'discuss/discuss.module';
import { WidgetModule } from "widget/widget.module";

import { CdeGeneralDetailsComponent } from "./components/summary/cdeGeneralDetails.component";
import { ValueDomainSummaryComponent } from "./components/summary/valueDomainSummary.component";
import { TreeModule } from "angular-tree-component/dist/angular-tree-component";


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
        ValueDomainSummaryComponent,
    ],
    entryComponents: [
    ],
    exports: [
        CdeGeneralDetailsComponent,
        ValueDomainSummaryComponent,
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeModule {
}
