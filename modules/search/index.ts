import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SummaryHeadingComponent } from "./searchResults/summaryHeading.component";
import { SummaryListComponent } from "./searchResults/summaryList.component";
import { SummaryListItemComponent, SummaryPlaceholderDirective } from "./searchResults/summaryListItem.component";
import { TableListComponent } from "./searchResults/tableList.component";

export { SummaryComponent } from "./searchResults/summaryListItem.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
    ],
    declarations: [
        SummaryHeadingComponent,
        SummaryListComponent,
        SummaryListItemComponent,
        SummaryPlaceholderDirective,
        TableListComponent,
    ],
    entryComponents: [
        TableListComponent,
    ],
    exports: [
        SummaryHeadingComponent,
        SummaryListComponent,
        TableListComponent,
    ],
    providers: [
    ],
})
export class SearchModule {
}
