import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from "@angular/router";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { CompareModule } from 'compare/compare.module';
import { DataElementQuickBoardComponent } from 'quickBoard/dataElementQuickBoard/dataElementQuickBoardComponent';
import { FormQuickBoardComponent } from 'quickBoard/formQuickBoard/formQuickBoardComponent';
import { QuickBoardComponent } from 'quickBoard/quickBoard.component';
import { SearchModule } from 'search/search.module';
import { WidgetModule } from 'widget/widget.module';
import { FormSearchModule } from 'form/public/formSearch.module';


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
        // core
        WidgetModule,
        // internal
        CdeSearchModule,
        FormSearchModule,
    ],
    declarations: [
        DataElementQuickBoardComponent,
        FormQuickBoardComponent,
        QuickBoardComponent,
    ],
    entryComponents: [QuickBoardComponent],
    exports: [],
    providers: [],
})
export class QuickBoardModule {
}