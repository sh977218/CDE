import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AccordionListHeadingComponent } from 'search/listView/accordionListHeading.component';
import { ListViewComponent } from 'search/listView/listView.component';
import { ListViewControlsComponent } from 'search/listView/listViewControls.component';
import { SearchExportButtonComponent } from 'search/searchExportButton.component';
import { SummaryHeadingComponent } from 'search/listView/summaryHeading.component';
import { SummaryListComponent } from 'search/listView/summaryList.component';
import { SummaryListItemComponent, SummaryPlaceholderDirective } from 'search/listView/summaryListItem.component';
import { TableListComponent } from 'search/listView/tableList.component';
import { WidgetModule } from 'widget/widget.module';
import { MatButtonModule, MatIconModule, MatMenuModule } from "@angular/material";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild([]),
        // core
        WidgetModule,
        // internal
        MatButtonModule,
        MatIconModule,
        MatMenuModule
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
    ],
    entryComponents: [
        ListViewComponent,
        ListViewControlsComponent,
        SummaryListComponent,
        TableListComponent,
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
    providers: [
    ],
})
export class SearchModule {
}
