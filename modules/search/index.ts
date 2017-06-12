import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { PinAccordionComponent } from "./pins/pinAccordion.component";
import { PinFormQuickboardComponent } from "./pins/pinFormQuickboard.component";
import { PinQuickboardComponent } from "./pins/pinQuickboard.component";
import { SummaryHeadingComponent } from "./searchResults/summaryHeading.component";
import { SummaryListComponent } from "./searchResults/summaryList.component";
import { SummaryListItemComponent, SummaryPlaceholderDirective } from "./searchResults/summaryListItem.component";

export { SummaryComponent } from "./searchResults/summaryListItem.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
    ],
    declarations: [
        PinAccordionComponent,
        PinFormQuickboardComponent,
        PinQuickboardComponent,
        SummaryHeadingComponent,
        SummaryListComponent,
        SummaryListItemComponent,
        SummaryPlaceholderDirective,
    ],
    entryComponents: [
    ],
    exports: [
        PinAccordionComponent,
        PinFormQuickboardComponent,
        PinQuickboardComponent,
        SummaryHeadingComponent,
        SummaryListComponent,
    ],
    providers: [
    ],
})
export class SearchModule {
}
