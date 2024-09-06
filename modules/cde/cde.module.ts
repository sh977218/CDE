import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { RouterModule } from '@angular/router';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { BoardModule } from 'board/board.module';
import { CdeAccordionListComponent } from 'cde/listView/cdeAccordionList.component';
import { CdeGeneralDetailsComponent } from 'cde/summary/cdeGeneralDetails.component';
import { ValueDomainSummaryComponent } from 'cde/summary/valueDomainSummary.component';
import { SearchModule } from 'search/search.module';
import { PinToBoardModule } from 'board/pin-to-board.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        RouterModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        // non-core
        // internal
        AdminItemModule,
        BoardModule,
        PinToBoardModule,
        SearchModule,
    ],
    declarations: [CdeAccordionListComponent, CdeGeneralDetailsComponent, ValueDomainSummaryComponent],
    exports: [CdeAccordionListComponent, CdeGeneralDetailsComponent, ValueDomainSummaryComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CdeModule {}
