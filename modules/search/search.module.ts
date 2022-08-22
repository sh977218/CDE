import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

import { AccordionListHeadingComponent } from 'search/listView/accordionListHeading.component';
import { ListViewComponent } from 'search/listView/listView.component';
import { ListViewControlsComponent } from 'search/listView/listViewControls.component';
import { SummaryHeadingComponent } from 'search/listView/summaryHeading.component';
import { SummaryListComponent } from 'search/listView/summaryList.component';
import {
    SummaryListItemComponent,
    SummaryPlaceholderDirective,
} from 'search/listView/summaryListItem.component';
import { TableListComponent } from 'search/listView/tableList.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { PinToBoardModule } from 'board/pin-to-board.module';
import { OrgDetailModalComponent } from 'org-detail-modal/org-detail-modal.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild([]),
        // non-core
        MatIconModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTabsModule,
        MatTooltipModule,
        TourMatMenuModule,
        PinToBoardModule,
    ],
    declarations: [
        AccordionListHeadingComponent,
        ListViewComponent,
        ListViewControlsComponent,
        SummaryHeadingComponent,
        SummaryListComponent,
        SummaryListItemComponent,
        SummaryPlaceholderDirective,
        TableListComponent,
        OrgDetailModalComponent,
    ],
    exports: [
        AccordionListHeadingComponent,
        ListViewComponent,
        ListViewControlsComponent,
        SummaryHeadingComponent,
        SummaryListComponent,
        TableListComponent,
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SearchModule {}
