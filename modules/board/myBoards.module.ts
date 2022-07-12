import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { BoardModule } from 'board/board.module';
import { MyBoardsComponent } from 'board/myBoards/myBoards.component';
import { MatIconModule } from '@angular/material/icon';
import { CreateBoardModule } from 'board/create-board.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BoardOverviewModule } from 'board/board-overview.module';

const boardRoutes: Routes = [
    {path: '', component: MyBoardsComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(boardRoutes),
        MatIconModule,
        MatSidenavModule,
        MatCheckboxModule,
        // non-core

        // internal
        BoardModule,
        CreateBoardModule,
        BoardOverviewModule,
    ],
    declarations: [
        MyBoardsComponent,
    ],
    providers: [],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class MyBoardsModule {

}
