import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from '@ng-select/ng-select';

import { BoardFormSummaryListComponent } from "./components/listView/boardFormSummaryList.component";
import { BoardFormSummaryListContentComponent } from "./components/listView/boardFormSummaryListContent.component";
import { BoardModule } from 'board/public/board.module';
import { FormAccordionListComponent } from "./components/listView/formAccordionList.component";
import { FormSearchComponent } from "./components/search/formSearch.component";
import { FormSummaryListContentComponent } from "./components/listView/formSummaryListContent.component";
import { SearchModule } from "search/search.module";
import { QuickBoardFormSummaryListContentComponent } from 'form/public/components/listView/quickBoardFormSummaryListContent.component';
import { WidgetModule } from "widget/widget.module";
import { FormTableViewPreferencesComponent } from "search/tableViewPreferences/formTableViewPreferencesComponent";
import {
    MatButtonModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatDialogModule,
    MatGridListModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatAutocompleteModule, MatTabsModule
} from "@angular/material";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        NgSelectModule,
        // core
        WidgetModule,
        // internal
        BoardModule,
        ReactiveFormsModule,
        SearchModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatPaginatorModule,
        MatInputModule,
        MatMenuModule,
        MatCheckboxModule,
        MatGridListModule,
        MatIconModule,
        MatListModule,
        MatDialogModule,
        MatSelectModule,
        MatTabsModule,
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
