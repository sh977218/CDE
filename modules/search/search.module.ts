import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import {  } from "./upgrade-components";
import { AccordionListHeadingComponent } from "./listView/accordionListHeading.component";
import { ListViewControlsComponent } from "./listView/listViewControls.component";
import { SearchExportButtonComponent } from "./searchExportButton.component";
import { SummaryHeadingComponent } from "./listView/summaryHeading.component";
import { SummaryListComponent } from "./listView/summaryList.component";
import { SummaryListItemComponent, SummaryPlaceholderDirective } from "./listView/summaryListItem.component";
import { TableListComponent } from "./listView/tableList.component";
import { ListViewComponent } from 'search/listView/listView.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
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
