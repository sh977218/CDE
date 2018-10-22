import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '_app/alert.service';

@Injectable()
export class ApprovalService {
    funcCommentApprove = this.commentApprove.bind(this);
    funcCommentDecline = this.commentDecline.bind(this);

    constructor(private alert: AlertService,
                private http: HttpClient) {
    }

    commentApprove(t: any, cb) {
        this.http.post('/server/discuss/approveComment',
            t.task.reply ? {replyId: t.task._id} : {commentId: t.task._id},
            {responseType: 'text'}
        ).subscribe(response => {
            this.alert.addAlert('success', response);
            cb();
        }, err => {
            this.alert.httpErrorMessageAlert(err);
            cb();
        });
    }

    commentDecline(t: any, cb) {
        this.http.post('/server/discuss/declineComment',
            t.task.reply ? {replyId: t.task._id} : {commentId: t.task._id},
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