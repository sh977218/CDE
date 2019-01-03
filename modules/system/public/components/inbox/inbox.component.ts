import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import _noop from 'lodash/noop';
import { decamelize } from 'shared/system/util';

type InboxMessage = any;

@Component({
    selector: 'cde-inbox',
    templateUrl: 'inbox.component.html'
})
export class InboxComponent {
    mail: any = {received: [], sent: [], archived: []};

    constructor(private alert: AlertService,
                private http: HttpClient) {
        this.getAllMail();
    }

    closeMessage(message: InboxMessage) {
        message.states.unshift({
            action: 'Approved',
            date: new Date(),
            comment: ''
        });
        this.http.post('/mail/messages/update', message).subscribe(() => {
            this.alert.addAlert('success', 'Message moved to archived.');
            this.getAllMail();
        }, () => this.alert.addAlert('danger', 'Message couldn\'t be retired.'));
    }

    getAllMail() {
        this.getMail('received');
        this.getMail('sent');
        this.getMail('archived');
    }

    getMail(type: string) {
        // TODO make sure it's ordered by date
        this.http.post<any[]>('/mail/messages/' + type, {}).subscribe(mail => {
            this.mail[type] = mail;
            mail.forEach(msg => msg.humanType = decamelize(msg.type));
        }, _noop);
    }
}
