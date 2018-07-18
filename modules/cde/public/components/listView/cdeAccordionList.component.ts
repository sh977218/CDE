import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import _noop from 'lodash/noop';

import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { Elt, User } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    templateUrl: './cdeAccordionList.component.html'
})
export class CdeAccordionListComponent {
    @Input() addMode: any = null;
    @Input() location: string = null;
    @Input() elts: DataElement[];
    @Input() openInNewTab: boolean = false;
    @Output() add = new EventEmitter<DataElement>();

    module = 'cde';
    pinModal: any;
    user: User;
    Elt = Elt;

    @ViewChild("pinModalCde") public pinModalCde: PinBoardModalComponent;

    constructor(private userService: UserService,
                public quickBoard: QuickBoardListService) {

        this.userService.then(user => {
            this.user = user;
        }, _noop);
    }
}