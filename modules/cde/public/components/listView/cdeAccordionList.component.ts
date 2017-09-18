import { Component, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { Elt, User } from 'core/public/models.model';
import { DataElement } from 'cde/public/dataElement.model';
import { PinBoardModalComponent } from "../../../../board/public/components/pins/pinBoardModal.component";
import { UserService } from "../../../../core/public/user.service";

@Component({
    selector: 'cde-cde-accordion-list',
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
                @Inject('QuickBoard') public quickBoard) {

        this.userService.then(() => {
            this.user = this.userService.user;
        });
    }
}