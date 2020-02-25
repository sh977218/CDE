import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { BoardModule } from 'board/public/board.module';
import { PublicBoardsComponent } from 'board/public/components/publicBoards/publicBoards.component';

import { NonCoreModule } from 'non-core/noncore.module';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

const boardRoutes: Routes = [
    {path: '', component: PublicBoardsComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(boardRoutes),
        // non-core
        NonCoreModule,

        // internal
        BoardModule,
        MatIconModule,
        MatInputModule
    ],
    declarations: [
        PublicBoardsComponent,
    ],
    entryComponents: [],
    providers: [],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class BoardListModule {

}
