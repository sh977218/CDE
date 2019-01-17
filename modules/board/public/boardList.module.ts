import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { BoardModule } from 'board/public/board.module';
import { PublicBoardsComponent } from 'board/public/components/publicBoards/publicBoards.component';

import { MatIconModule, MatInputModule } from "@angular/material";

const boardRoutes: Routes = [
    {path: '', component: PublicBoardsComponent},
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
        MatInputModule
    ],
    declarations: [
        PublicBoardsComponent,
    ],
    entryComponents: [
    ],
    providers: [
    ],
    exports: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class BoardListModule {

}
