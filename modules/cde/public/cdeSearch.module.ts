import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BoardCdeSummaryListComponent } from 'cde/public/components/listView/boardCdeSummaryList.component';
import { BoardCdeSummaryListContentComponent } from 'cde/public/components/listView/boardCdeSummaryListContent.component';
import { BoardModule } from 'board/public/board.module';
import { CdeModule } from 'cde/public/cde.module';
import { CdeSearchComponent } from 'cde/public/components/search/cdeSearch.component';
import { CdeSummaryListContentComponent } from 'cde/public/components/listView/cdeSummaryListContent.component';
import { QuickBoardCdeSummaryListContentComponent } from 'cde/public/components/listView/quickBoardCdeSummaryListContent.component';
import { SearchModule } from 'search/search.module';
import { WidgetModule } from 'widget/widget.module';
import { CdeTableViewPreferencesComponent } from "../../search/tableViewPreferences/cdeTableViewPreferencesComponent";
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatGridListModule,
    MatListModule,
    MatSelectModule,
    MatIconModule
} from "@angular/material";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule,
        // core
        WidgetModule,
        // internal
        BoardModule,
        CdeModule,
        SearchModule,
        MatButtonModule,
        MatCheckboxModule,
        MatGridListModule,
        MatListModule,
        MatDialogModule,
        MatIconModule,
        MatSelectModule
    ],
    declarations: [
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
        CdeSearchComponent,
        CdeSummaryListContentComponent,
        CdeTableViewPreferencesComponent,
        QuickBoardCdeSummaryListContentComponent,
    ],
    entryComponents: [
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
        CdeSummaryListContentComponent,
        CdeTableViewPreferencesComponent,
        QuickBoardCdeSummaryListContentComponent,
    ],
    exports: [
        CdeSearchComponent,
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeSearchModule {
}
