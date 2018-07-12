import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert.service';
import { SaveModalComponent } from 'adminItem/public/components/saveModal/saveModal.component';


@Component({
    selector: 'cde-inbox',
    templateUrl: 'inbox.component.html'
})
export class InboxComponent implements OnInit {
    @ViewChild('saveModal') saveModal: SaveModalComponent;
    @ViewChild('approveUserModal') approveUserModal: SaveModalComponent;
    approveUserModalRef: NgbModalRef;
    currentMessage: any;
    mail: any = {received: [], sent: [], archived: []};

    ngOnInit() {
        this.getAllMail();
    }

    constructor(private alert: AlertService,
                private http: HttpClient,
                public modalService: NgbModal) {
    }

    approveComment(msg) {
        this.http.post('/server/discuss/approveComment', {
            commentId: msg.typeCommentApproval.comment.commentId, replyIndex: msg.typeCommentApproval.comment.replyIndex
        }, {responseType: 'text'}).subscribe(response => {
            this.alert.addAlert('success', response);
            this.closeMessage(msg);
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    approveAttachment(msg) {
        this.http.get('/attachment/approve/' + msg.typeAttachmentApproval.fileid, {responseType: 'text'}).subscribe(response => {
            this.alert.addAlert('success', response);
            this.closeMessage(msg);
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    authorizeUser(msg) {
        let request = {username: msg.author.name, role: 'CommentAuthor'};
        this.http.post('/addUserRole', request, {responseType: 'text'}).subscribe(response => {
            this.alert.addAlert('success', response);
        }, err => this.alert.httpErrorMessageAlert(err));
        this.approveUserModalRef.close();
    }

    closeMessage(message) {
        message.states.unshift({
            action: 'Approved',
            date: new Date(),
            comment: ''
        });
        this.http.post('/mail/messages/update', message).subscribe(() => {
            this.alert.addAlert('success', 'Message moved to archived.');
            this.getAllMail();
        }, () => {
            this.alert.addAlert('danger', 'Message couldn\'t be retired.');
        });
    }

    decamelize(str) {
        let result = str
            .replace(/([a-z\d])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2')
            .toLowerCase();
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    declineAttachment(msg) {
        this.http.get('/attachment/decline/' + msg.typeAttachmentApproval.fileid, {responseType: 'text'}).subscribe(response => {
            this.alert.addAlert('success', response);
            this.closeMessage(msg);
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    declineComment(msg) {
        this.http.post('/server/discuss/declineComment', {
            commentId: msg.typeCommentApproval.comment.commentId, replyIndex: msg.typeCommentApproval.comment.replyIndex
        }, {responseType: 'text'}).subscribe(response => {
            this.alert.addAlert('success', response);
            this.closeMessage(msg);
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    getAllMail() {
        this.getMail('received');
        this.getMail('sent');
        this.getMail('archived');
    }

    getMail(type) {
        // TODO make sure it's ordered by date
        this.http.post<any[]>('/mail/messages/' + type, {}).subscribe(mail => {
            this.mail[type] = mail;
            mail.forEach(msg => msg.humanType = this.decamelize(msg.type));
        });
    }

    openAuthorizeUserModal(message) {
        this.currentMessage = message;
        this.approveUserModalRef = this.modalService.open(this.approveUserModal);
    }
}
