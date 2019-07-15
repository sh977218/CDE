import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '_app/user.service';
import { Attachment, Item } from 'shared/models.model';
import { hasRole } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-attachments',
    templateUrl: './attachments.component.html'
})
export class AttachmentsComponent {
    @Input() elt!: Item;
    @Input() canEdit: boolean = false;
    @Output() removeAttachment = new EventEmitter<number>();
    @Output() setDefault = new EventEmitter<number>();
    @Output() upload = new EventEmitter<Event>();
    canReviewAttachment: boolean;

    constructor(private userService: UserService) {
        this.canReviewAttachment = hasRole(this.userService.user, 'AttachmentReviewer');
    }

    copyUrl(attachment: Attachment) {
        let url = (window as any).publicUrl + '/data/' + attachment.fileid;
        if (attachment.filetype && attachment.filetype.indexOf('video') > -1) {
            url += '.mp4';
        }
        let copyElement = document.createElement('input');
        copyElement.setAttribute('type', 'text');
        copyElement.setAttribute('value', url);
        document.body.appendChild(copyElement);
        copyElement.select();
        try {
            if (!document.execCommand('copy')) throw 'Not allowed.';
            copyElement.remove();
        } catch (e) {
            copyElement.remove();
            prompt('Copy the text below. (ctrl c, enter)', url);
        }
    }

    openFileDialog() {
        document.getElementById('fileToUpload')!.click();
    }

}
