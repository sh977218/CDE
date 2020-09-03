import { HttpClient } from '@angular/common/http';
import { forwardRef, Inject, Injectable } from '@angular/core';
import { NotificationTask } from '_app/notifications/notification.service';
import { AlertService } from 'alert/alert.service';
import { Cb } from 'shared/models.model';

@Injectable()
export class ApprovalService {
    funcAttachmentApprove = this.attachmentApprove.bind(this);
    funcAttachmentDecline = this.attachmentDecline.bind(this);
    funcCommentApprove = this.commentApprove.bind(this);
    funcCommentDecline = this.commentDecline.bind(this);

    constructor(
        @Inject(forwardRef(() => AlertService)) private alert: AlertService,
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
    ) {
    }

    attachmentApprove(t: NotificationTask, cb: Cb) {
        this.http.post('/server/attachment/approve/' + t.tasks[0].id, {}, {responseType: 'text'}
        ).subscribe(response => {
            this.alert.addAlert('success', response);
            cb();
        }, err => {
            this.alert.httpErrorMessageAlert(err);
            cb();
        });
    }

    attachmentDecline(t: NotificationTask, cb: Cb) {
        this.http.post('/server/attachment/decline/' + t.tasks[0].id, {}, {responseType: 'text'}
        ).subscribe(response => {
            this.alert.addAlert('success', response);
            cb();
        }, err => {
            this.alert.httpErrorMessageAlert(err);
            cb();
        });
    }

    commentApprove(t: NotificationTask, cb: Cb, skipAlert?: boolean) {
        this.http.post('/server/discuss/approveComment',
            t.tasks[0].idType === 'commentReply' ? {replyId: t.tasks[0].id} : {commentId: t.tasks[0].id},
            {responseType: 'text'}
        ).subscribe(response => {
            if (!skipAlert) {
                this.alert.addAlert('success', response);
            }
            cb();
        }, err => {
            this.alert.httpErrorMessageAlert(err);
            cb();
        });
    }

    commentDecline(t: NotificationTask, cb: Cb) {
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
