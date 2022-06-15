import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { BoardModule } from 'board/board.module';
import { MyBoardsComponent } from 'board/myBoards/myBoards.component';
import { MatIconModule } from '@angular/material/icon';
import { CreateBoardModule } from 'board/create-board.module';


const boardRoutes: Routes = [
    {path: '', component: MyBoardsComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(boardRoutes),
        MatIconModule,
        // non-core

        // internal
        BoardModule,
        CreateBoardModule
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
