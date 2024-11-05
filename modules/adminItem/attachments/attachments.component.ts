import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { Item } from 'shared/item';

@Component({
    selector: 'cde-attachments[elt]',
    templateUrl: './attachments.component.html',
    styleUrls: ['./attachments.component.scss'],
})
export class AttachmentsComponent {
    @Input() elt!: Item;
    @Input() canEdit = false;
    @Output() removeAttachment = new EventEmitter<number>();
    @Output() setDefault = new EventEmitter<number>();
    @Output() upload = new EventEmitter<Event>();

    constructor(public userService: UserService) {}

    openFileDialog() {
        const open = document.getElementById('fileToUpload');
        if (open) {
            open.click();
        }
    }
}
