import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { CompareModule } from 'compare/compare.module';
import { DataElementQuickBoardComponent } from 'quickBoard/dataElementQuickBoard/dataElementQuickBoard.component';
import { FormQuickBoardComponent } from 'quickBoard/formQuickBoard/formQuickBoard.component';
import { QuickBoardComponent } from 'quickBoard/quickBoard.component';
import { SearchModule } from 'search/search.module';

import { FormSearchModule } from 'form/public/formSearch.module';
import { BoardModule } from 'board/public/board.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

const qbRoutes: Routes = [
    {path: '', component: QuickBoardComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        SearchModule,
        CompareModule,
        RouterModule.forChild(qbRoutes),
        // non-core

        // internal
        BoardModule,
        CdeSearchModule,
        FormSearchModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule
    ],
    declarations: [
        DataElementQuickBoardComponent,
        FormQuickBoardComponent,
        QuickBoardComponent,
    ],
    exports: [],
    providers: [],
})
export class QuickBoardModule {
}
