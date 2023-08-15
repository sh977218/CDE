import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { DataElement } from 'shared/de/dataElement.model';
import { Elt, ModuleItem, User } from 'shared/models.model';

@Component({
    templateUrl: './cdeAccordionList.component.html',
})
export class CdeAccordionListComponent implements OnDestroy {
    @Input() addMode: string = '';
    @Input() location: string = 'null';
    @Input() elts!: DataElement[];
    @Input() openInNewTab = false;
    @Output() add = new EventEmitter<DataElement>();
    module: ModuleItem = 'cde';
    unsubscribeUser?: () => void;
    user: User | null = null;
    Elt = Elt;

    constructor(private userService: UserService) {
        this.unsubscribeUser = this.userService.subscribe(user => {
            this.user = user;
        });
    }

    ngOnDestroy() {
        if (this.unsubscribeUser) {
            this.unsubscribeUser();
            this.unsubscribeUser = undefined;
        }
    }
}
