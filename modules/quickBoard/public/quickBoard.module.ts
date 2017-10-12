import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SearchModule } from 'search/search.module';
import { QuickBoardComponent } from 'quickBoard/public/quickBoard.component';
import { DataElementQuickBoardComponent } from 'quickBoard/public/dataElementQuickBoard/dataElementQuickBoardComponent';
import { FormQuickBoardComponent } from 'quickBoard/public/formQuickBoard/formQuickBoardComponent';
import { CompareModule } from 'compare/compare.module';
import { RouterModule, Routes } from "@angular/router";

const qbRoutes: Routes = [
    {path: 'quickBoard', component: QuickBoardComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        SearchModule,
        CompareModule,
        RouterModule.forChild(qbRoutes)
    ],
    declarations: [
        DataElementQuickBoardComponent,
        FormQuickBoardComponent,
        QuickBoardComponent,
    ],
    entryComponents: [QuickBoardComponent],
    exports: [RouterModule],
    providers: [],
})
export class QuickBoardModule {
}