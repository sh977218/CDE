import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BoardModule } from 'board/public/board.module';
import { CdeModule } from 'cde/public/cde.module';
import { BoardCdeSummaryListComponent } from 'cde/public/components/listView/boardCdeSummaryList.component';
import { BoardCdeSummaryListContentComponent } from 'cde/public/components/listView/boardCdeSummaryListContent.component';
import { CdeSummaryListContentComponent } from 'cde/public/components/listView/cdeSummaryListContent.component';
import { CdeSearchComponent } from 'cde/public/components/search/cdeSearch.component';
import { SearchModule } from 'search/search.module';
import { CdeTableViewPreferencesComponent } from 'search/tableViewPreferences/cdeTableViewPreferencesComponent';
import { TagModule } from 'tag/tag.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
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
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
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
        RouterModule,
        // non-core

        // internal
        BoardModule,
        CdeModule,
        SearchModule,
        TagModule,
        TourMatMenuModule
    ],
    declarations: [
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
        CdeSearchComponent,
        CdeSummaryListContentComponent,
        CdeTableViewPreferencesComponent,
    ],
    exports: [
        CdeSearchComponent,
    ],
    entryComponents: [
        BoardCdeSummaryListComponent,
        BoardCdeSummaryListContentComponent,
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeSearchModule {
}
