import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateBoardComponent } from 'board/create-board/create-board.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
    ],
    declarations: [
        CreateBoardComponent,
    ],
    providers: [],
    exports: [CreateBoardComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateBoardModule {

}
