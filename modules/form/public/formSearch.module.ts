import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BoardModule } from 'board/public/board.module';
import { BoardFormSummaryListComponent } from 'form/public/components/listView/boardFormSummaryList.component';
import { BoardFormSummaryListContentComponent } from 'form/public/components/listView/boardFormSummaryListContent.component';
import { FormAccordionListComponent } from 'form/public/components/listView/formAccordionList.component';
import { FormSummaryListContentComponent } from 'form/public/components/listView/formSummaryListContent.component';
import { FormSearchComponent } from 'form/public/components/search/formSearch.component';
import { SearchModule } from 'search/search.module';
import { FormTableViewPreferencesComponent } from 'search/tableViewPreferences/formTableViewPreferencesComponent';
import { TagModule } from 'tag/tag.module';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

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
        MatCardModule,
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
    ],
    exports: [
        FormSearchComponent,
    ],
    entryComponents: [
        FormSummaryListContentComponent,
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormSearchModule {
}
