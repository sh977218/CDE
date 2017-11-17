import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { BoardFormSummaryListComponent } from "./components/listView/boardFormSummaryList.component";
import { BoardFormSummaryListContentComponent } from "./components/listView/boardFormSummaryListContent.component";
import { BoardModule } from 'board/public/board.module';
import { FormAccordionListComponent } from "./components/listView/formAccordionList.component";
import { FormSearchComponent } from "./components/search/formSearch.component";
import { FormSummaryListContentComponent } from "./components/listView/formSummaryListContent.component";
import { SearchModule } from "search/search.module";
import { QuickBoardFormSummaryListContentComponent } from 'form/public/components/listView/quickBoardFormSummaryListContent.component';
import { WidgetModule } from "widget/widget.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        // core
        WidgetModule,
        // internal
        BoardModule,
        SearchModule,
    ],
    declarations: [
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        FormAccordionListComponent,
        FormSearchComponent,
        FormSummaryListContentComponent,
        QuickBoardFormSummaryListContentComponent,
    ],
    entryComponents: [
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        FormAccordionListComponent,
        FormSummaryListContentComponent,
        QuickBoardFormSummaryListContentComponent,
    ],
    exports: [
        FormSearchComponent,
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormSearchModule {
}
