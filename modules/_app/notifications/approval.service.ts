import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificationTask } from '_app/notifications/notification.service';
import { AlertService } from 'alert/alert.service';

@Injectable()
export class ApprovalService {
    funcCommentApprove = this.commentApprove.bind(this);
    funcCommentDecline = this.commentDecline.bind(this);

    constructor(private alert: AlertService,
                private http: HttpClient) {
    }

    commentApprove(t: NotificationTask, cb) {
        this.http.post('/server/discuss/approveComment',
            t.tasks[0].idType === 'commentReply' ? {replyId: t.tasks[0].id} : {commentId: t.tasks[0].id},
            {responseType: 'text'}
        ).subscribe(response => {
            this.alert.addAlert('success', response);
            cb();
        }, err => {
            this.alert.httpErrorMessageAlert(err);
            cb();
        });
    }

    commentDecline(t: NotificationTask, cb) {
        this.http.post('/server/discuss/declineComment',
            t.tasks[0].idType === 'commentReply' ? {replyId: t.tasks[0].id} : {commentId: t.tasks[0].id},
            {responseType: 'text'}
        ).subscribe(response => {
            this.alert.addAlert('success', response);
            cb();
        }, err => {
            this.alert.httpErrorMessageAlert(err);
            cb();
        });
    }
}
