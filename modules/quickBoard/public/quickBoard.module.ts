import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SearchModule } from 'search/search.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        SearchModule
    ],
    declarations: [],
    entryComponents: [],
    exports: [],
    providers: [],
})
export class QuickBoardModule {
}