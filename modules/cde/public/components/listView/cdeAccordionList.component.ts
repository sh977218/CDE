import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import * as _noop from 'lodash/noop';
import { DataElement } from 'shared/de/dataElement.model';
import { Elt, ModuleItem, User } from 'shared/models.model';

@Component({
    templateUrl: './cdeAccordionList.component.html'
})
export class CdeAccordionListComponent {
    @Input() addMode: string = '';
    @Input() location: string = 'null';
    @Input() elts!: DataElement[];
    @Input() openInNewTab = false;
    @Output() add = new EventEmitter<DataElement>();
    @ViewChild('pinModalCde', {static: true}) pinModalCde!: PinBoardModalComponent;
    module: ModuleItem = 'cde';
    pinModal: any;
    user!: User;
    Elt = Elt;

    constructor(private userService: UserService,
                public quickBoard: QuickBoardListService) {

        this.userService.then(user => {
            this.user = user;
        }, _noop);
    }
}
