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
import { FormTableViewPreferencesComponent } from "../../search/tableViewPreferences/formTableViewPreferencesComponent";
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatGridListModule,
    MatListModule,
    MatSelectModule
} from "@angular/material";

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
        MatButtonModule,
        MatCheckboxModule,
        MatGridListModule,
        MatListModule,
        MatDialogModule,
        MatSelectModule
    ],
    declarations: [
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        FormAccordionListComponent,
        FormSearchComponent,
        FormSummaryListContentComponent,
        FormTableViewPreferencesComponent,
        QuickBoardFormSummaryListContentComponent,
    ],
    entryComponents: [
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        FormAccordionListComponent,
        FormSummaryListContentComponent,
        FormTableViewPreferencesComponent,
        QuickBoardFormSummaryListContentComponent,
    ],
    exports: [
        FormSearchComponent,
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormSearchModule {
}
