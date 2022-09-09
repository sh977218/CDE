import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

import { BoardModule } from 'board/board.module';
import { BoardFormSummaryListComponent } from 'form/listView/boardFormSummaryList.component';
import { BoardFormSummaryListContentComponent } from 'form/listView/boardFormSummaryListContent.component';
import { FormAccordionListComponent } from 'form/listView/formAccordionList.component';
import { FormSummaryListContentComponent } from 'form/listView/formSummaryListContent.component';
import { FormSearchComponent } from 'form/search/formSearch.component';
import { SearchModule } from 'search/search.module';
import { FormTableViewPreferencesComponent } from 'search/tableViewPreferences/formTableViewPreferencesComponent';
import { TagModule } from 'tag/tag.module';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { PinToBoardModule } from 'board/pin-to-board.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
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
        // non-core
        // internal
        BoardModule,
        PinToBoardModule,
        SearchModule,
        TagModule,
        TourMatMenuModule,
    ],
    declarations: [
        BoardFormSummaryListComponent,
        BoardFormSummaryListContentComponent,
        FormAccordionListComponent,
        FormSearchComponent,
        FormSummaryListContentComponent,
        FormTableViewPreferencesComponent,
    ],
    exports: [FormSearchComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormSearchModule {}
