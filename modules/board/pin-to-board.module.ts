import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { PinToBoardDirective } from 'board/pin-to-board/pin-to-board.directive';
import { PinToBoardModalComponent } from 'board/pin-to-board/pin-to-board-modal/pin-to-board-modal.component';
import { PinToBoardLogInModalComponent } from 'board/pin-to-board/pin-to-board-log-in-modal/pin-to-board-log-in-modal.component';
import { BoardOverviewModule } from 'board/board-overview.module';
import { CreateBoardComponent } from 'board/create-board/create-board.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,

        MatDialogModule,
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        CreateBoardComponent,
        BoardOverviewModule,
    ],
    declarations: [PinToBoardDirective, PinToBoardLogInModalComponent, PinToBoardModalComponent],
    providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
    ],
    exports: [PinToBoardDirective],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PinToBoardModule {}
