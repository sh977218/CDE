import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { BoardModule } from 'board/public/board.module';
import { MyBoardsComponent } from 'board/public/components/myBoards/myBoards.component';

import { MatIconModule, MatProgressSpinnerModule } from '@angular/material';

const boardRoutes: Routes = [
    {path: '', component: MyBoardsComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(boardRoutes),
        // core

        // internal
        BoardModule,
        MatIconModule,
    ],
    declarations: [
        MyBoardsComponent,
    ],
    entryComponents: [],
    providers: [],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class MyBoardsModule {

}
