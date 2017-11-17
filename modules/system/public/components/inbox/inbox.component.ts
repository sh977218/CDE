import { Component, OnInit, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { SaveModalComponent } from "adminItem/public/components/saveModal/saveModal.component";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: "cde-inbox",
    templateUrl: "inbox.component.html"
})
export class InboxComponent implements OnInit {

    @ViewChild("saveModal") public saveModal: SaveModalComponent;
    @ViewChild("approveUserModal") public approveUserModal: SaveModalComponent;

    constructor(private http: Http,
                private alert: AlertService,
                public modalService: NgbModal) {}

    mail: any = {received: [], sent: [], archived: []};
    currentMessage: any;

    approveUserModalRef: NgbModalRef;

    ngOnInit () {
        this.getAllMail();
    }

    getMail (type) {
        // TODO make sure it's ordered by date
        this.http.post("/mail/messages/" + type, {}).map(r => r.json()).subscribe(mail => {
            this.mail[type] = mail;
            mail.forEach(msg => msg.humanType = this.decamelize(msg.type));
        });
    };

    getAllMail () {
        this.getMail('received');
        this.getMail('sent');
        this.getMail('archived');
    };

    decamelize (str) {
        let result = str
            .replace(/([a-z\d])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2')
            .toLowerCase();
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    closeMessage (message) {
        message.states.unshift({
            "action" : "Approved",
            "date" : new Date(),
            "comment" : ""
        });
        this.http.post('/mail/messages/update', message).subscribe(() => {
            this.alert.addAlert("success", "Message moved to archived.");
            this.getAllMail();
        }, () => {
            this.alert.addAlert("danger", "Message couldn't be retired.");
        });
    }

    approveAttachment (msg) {
        this.http.get('/attachment/approve/' + msg.typeAttachmentApproval.fileid).map(r => r.text()).subscribe(response => {
            this.alert.addAlert("success", response);
            this.closeMessage(msg);
        }, response => {
            this.alert.addAlert("danger", response);
        });
    }

    declineAttachment (msg) {
        this.http.get('/attachment/decline/' + msg.typeAttachmentApproval.fileid).map(r => r.text()).subscribe(response => {
            this.alert.addAlert("success", response);
            this.closeMessage(msg);
        }, response => {
            this.alert.addAlert("danger", response);
        });
    }

    approveComment (msg) {
        this.http.post('/comments/approve', {
            commentId: msg.typeCommentApproval.comment.commentId, replyIndex: msg.typeCommentApproval.comment.replyIndex
        }).map(r => r.text()).subscribe(response => {
            this.alert.addAlert("success", response);
            this.closeMessage(msg);
        }, response => {
            this.alert.addAlert("danger", response);
        });
    }

    declineComment (msg) {
        this.http.post('/comments/decline', {
        //     commentId: msg.typeCommentApproval.comment.commentId, replyIndex: msg.typeCommentApproval.comment.replyIndex
        }).map(r => r.text()).subscribe(response => {
            this.alert.addAlert("success", response);
            this.closeMessage(msg);
        }, response => {
            this.alert.addAlert("danger", response);
        });
    }

    authorizeUser (msg) {
        let request = {username: msg.author.name, role: "CommentAuthor"};
        this.http.post('/addUserRole', request).map(r => r.text()).subscribe(response => {
            this.alert.addAlert("success", response);
        }, response => {
            this.alert.addAlert("danger", response);
        });
        this.approveUserModalRef.close();
    };

    openAuthorizeUserModal (message) {
        this.currentMessage = message;
        this.approveUserModalRef = this.modalService.open(this.approveUserModal);
    };

}