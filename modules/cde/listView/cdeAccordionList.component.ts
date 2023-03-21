import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { DataElement } from 'shared/de/dataElement.model';
import { Elt, ModuleItem, User } from 'shared/models.model';
import { noop } from 'shared/util';

@Component({
    templateUrl: './cdeAccordionList.component.html',
})
export class CdeAccordionListComponent {
    @Input() addMode: string = '';
    @Input() location: string = 'null';
    @Input() elts!: DataElement[];
    @Input() openInNewTab = false;
    @Output() add = new EventEmitter<DataElement>();
    module: ModuleItem = 'cde';
    user!: User;
    Elt = Elt;

    constructor(private userService: UserService) {
        this.userService.then(user => {
            this.user = user;
        }, noop);
    }
}
