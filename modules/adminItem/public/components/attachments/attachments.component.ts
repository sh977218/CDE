import { Component, Input, EventEmitter, Output } from '@angular/core';
import { hasRole } from 'shared/system/authorizationShared';
import { UserService } from '_app/user.service';

@Component({
    selector: 'cde-attachments',
    templateUrl: './attachments.component.html'
})
export class AttachmentsComponent {
    @Input() elt: any;
    @Input() canEdit: boolean = false;
    @Output() removeAttachment = new EventEmitter();
    @Output() setDefault = new EventEmitter();
    @Output() upload = new EventEmitter();

    constructor(private userService: UserService) {}

    copyUrl(attachment) {
        let url = (window as any).publicUrl + '/data/' + attachment.fileid;
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
        document.getElementById("fileToUpload").click();
    }

    canReviewAttachment() {
        return hasRole(this.userService.user, 'AttachmentReviewer');
    }

}
