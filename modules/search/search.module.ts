import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCheckboxModule, MatSelectModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { AccordionListHeadingComponent } from 'search/listView/accordionListHeading.component';
import { ListViewComponent } from 'search/listView/listView.component';
import { ListViewControlsComponent } from 'search/listView/listViewControls.component';
import { SearchExportButtonComponent } from 'search/searchExportButton.component';
import { SummaryHeadingComponent } from 'search/listView/summaryHeading.component';
import { SummaryListComponent } from 'search/listView/summaryList.component';
import { SummaryListItemComponent, SummaryPlaceholderDirective } from 'search/listView/summaryListItem.component';
import { TableListComponent } from 'search/listView/tableList.component';
import { WidgetModule } from 'widget/widget.module';
import { TableViewPreferencesComponent } from 'search/tableViewPreferences/tableViewPreferences.component';
import { CdeTableViewPreferencesComponent } from 'search/tableViewPreferences/cdeTableViewPreferencesComponent';
import { FormTableViewPreferencesComponent } from 'search/tableViewPreferences/formTableViewPreferencesComponent';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        FormsModule,
        MatCheckboxModule,
        MatSelectModule,
        NgbModule,
        NgSelectModule,
        RouterModule.forChild([]),
        // core
        WidgetModule,
        // internal
    ],
    declarations: [
        AccordionListHeadingComponent,
        ListViewComponent,
        ListViewControlsComponent,
        SearchExportButtonComponent,
        SummaryHeadingComponent,
        SummaryListComponent,
        SummaryListItemComponent,
        SummaryPlaceholderDirective,
        TableListComponent,
        TableViewPreferencesComponent,
        CdeTableViewPreferencesComponent,
        FormTableViewPreferencesComponent
    ],
    entryComponents: [
        ListViewComponent,
        ListViewControlsComponent,
        SummaryListComponent,
        TableListComponent,
        CdeTableViewPreferencesComponent,
        FormTableViewPreferencesComponent
    ],
    exports: [
        AccordionListHeadingComponent,
        ListViewComponent,
        ListViewControlsComponent,
        SearchExportButtonComponent,
        SummaryHeadingComponent,
        SummaryListComponent,
        TableListComponent,
    ],
    providers: [],
})
export class SearchModule {
}
