import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AdminItemModule } from 'adminItem/adminItem.module';
import { BoardModule } from 'board/board.module';
import { BoardViewComponent } from 'board/boardView/boardView.component';
import { CdeSearchModule } from 'cde/cdeSearch.module';
import { CompareModule } from 'compare/compare.module';
import { DiscussModule } from 'discuss/discuss.module';
import { FormSearchModule } from 'form/formSearch.module';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';
import { SearchModule } from 'search/search.module';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';


const boardRoutes: Routes = [
    {path: '', component: BoardViewComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(boardRoutes),
        // non-core

        // internal
        AdminItemModule,
        BoardModule,
        DiscussModule,
        CdeSearchModule,
        FormSearchModule,
        NativeRenderModule,
        SearchModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatPaginatorModule,
        CompareModule
    ],
    declarations: [
        BoardViewComponent,
    ],
    providers: [],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BoardViewModule {

}