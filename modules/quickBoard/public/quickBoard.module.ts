import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SearchModule } from 'search/search.module';
import { QuickBoardComponent } from 'quickBoard/public/quickBoard.component';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        SearchModule
    ],
    declarations: [QuickBoardComponent],
    entryComponents: [QuickBoardComponent],
    exports: [],
    providers: [],
})
export class QuickBoardModule {
}