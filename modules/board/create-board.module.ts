import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateBoardComponent } from 'board/create-board/create-board.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateBoardModalComponent } from 'board/create-board/create-board-modal.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatDialogModule,
    ],
    declarations: [
        CreateBoardComponent,
        CreateBoardModalComponent
    ],
    entryComponents: [CreateBoardModalComponent,CreateBoardModalComponent],
    providers: [],
    exports: [CreateBoardComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateBoardModule {

}
