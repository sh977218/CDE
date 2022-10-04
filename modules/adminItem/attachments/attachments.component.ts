import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { Attachment, Item } from 'shared/models.model';

@Component({
    selector: 'cde-attachments[elt]',
    templateUrl: './attachments.component.html',
})
export class AttachmentsComponent {
    @Input() elt!: Item;
    @Input() canEdit = false;
    @Output() removeAttachment = new EventEmitter<number>();
    @Output() setDefault = new EventEmitter<number>();
    @Output() upload = new EventEmitter<Event>();

    constructor(public userService: UserService) {}

    copyUrl(attachment: Attachment) {
        let url =
            window.location.origin + '/server/system/data/' + attachment.fileid;
        if (attachment.filetype && attachment.filetype.indexOf('video') > -1) {
            url += '.mp4';
        }
        const copyElement = document.createElement('input');
        copyElement.setAttribute('type', 'text');
        copyElement.setAttribute('value', url);
        document.body.appendChild(copyElement);
        copyElement.select();
        try {
            if (!document.execCommand('copy')) {
                throw new Error('Not allowed.');
            }
            copyElement.remove();
        } catch (e) {
            copyElement.remove();
            prompt('Copy the text below. (ctrl c, enter)', url);
        }
    }

    openFileDialog() {
        const open = document.getElementById('fileToUpload');
        if (open) {
            open.click();
        }
    }
}
