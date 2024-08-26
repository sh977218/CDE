import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { CreateBoardModalComponent } from 'board/create-board/create-board-modal.component';
import { MyBoardsService } from 'board/myBoards.service';
import { Board } from 'shared/board.model';
import { Item } from 'shared/item';
import { ModuleItem } from 'shared/models.model';

@Component({
    selector: 'cde-create-board',
    templateUrl: './create-board.component.html',
    imports: [MatIconModule, NgIf],
    standalone: true,
})
export class CreateBoardComponent {
    @Input() elts: Item[] = [];
    @Input() module!: ModuleItem;
    newBoard?: Partial<Board>;

    constructor(
        public dialog: MatDialog,
        private alert: AlertService,
        public userService: UserService,
        public myBoardService: MyBoardsService
    ) {}

    openCreateNewBoardModal() {
        this.newBoard = {
            type: this.module,
            pins: this.elts.map(e => ({
                tinyId: e.tinyId,
                name: e.designations[0].designation,
                type: this.module,
                pinnedDate: new Date(),
            })),
        };

        this.dialog
            .open(CreateBoardModalComponent, {
                width: '800px',
                data: this.newBoard,
            })
            .afterClosed()
            .subscribe(newBoard => {
                if (newBoard) {
                    this.myBoardService.createBoard(newBoard).subscribe(
                        () => {
                            this.myBoardService.waitAndReload(() => this.alert.addAlert('success', 'Board created.'));
                        },
                        err => this.alert.httpErrorAlert(err)
                    );
                }
            });
    }
}
