import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { BoardModule } from 'board/board.module';
import { DeCompletionComponent } from 'cde/completion/deCompletion.component';
import { CreateDataElementComponent } from 'cde/createDataElement/createDataElement.component';
import { CdeAccordionListComponent } from 'cde/listView/cdeAccordionList.component';
import { CdeGeneralDetailsComponent } from 'cde/summary/cdeGeneralDetails.component';
import { ValueDomainSummaryComponent } from 'cde/summary/valueDomainSummary.component';
import { DiscussModule } from 'discuss/discuss.module';
import { SearchModule } from 'search/search.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        // non-core
        // internal
        AdminItemModule,
        BoardModule,
        DiscussModule,
        SearchModule,
    ],
    declarations: [
        CdeAccordionListComponent,
        CdeGeneralDetailsComponent,
        CreateDataElementComponent,
        DeCompletionComponent,
        ValueDomainSummaryComponent,
    ],
    exports: [
        CdeAccordionListComponent,
        CdeGeneralDetailsComponent,
        CreateDataElementComponent,
        DeCompletionComponent,
        ValueDomainSummaryComponent,
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeModule {
}
