import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    MatAutocompleteModule, MatTabsModule, MatTooltipModule
} from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BoardModule } from 'board/public/board.module';
import { BoardFormSummaryListComponent } from 'form/public/components/listView/boardFormSummaryList.component';
import { BoardFormSummaryListContentComponent } from 'form/public/components/listView/boardFormSummaryListContent.component';
import { FormAccordionListComponent } from 'form/public/components/listView/formAccordionList.component';
import { FormSummaryListContentComponent } from 'form/public/components/listView/formSummaryListContent.component';
import { QuickBoardFormSummaryListContentComponent } from 'form/public/components/listView/quickBoardFormSummaryListContent.component';
import { FormSearchComponent } from 'form/public/components/search/formSearch.component';
import { SearchModule } from 'search/search.module';
import { FormTableViewPreferencesComponent } from 'search/tableViewPreferences/formTableViewPreferencesComponent';
import { TagModule } from 'tag/tag.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatSelectModule,
        MatTabsModule,
        MatTooltipModule,
        NgbModule,
        // non-core

        // internal
        BoardModule,
        SearchModule,
        TagModule,
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
