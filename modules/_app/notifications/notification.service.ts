import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApprovalService } from '_app/notifications/approval.service';
import { UserService } from '_app/user.service';
import _noop from 'lodash/noop';
import { AlertService } from 'alert/alert.service';

@Injectable()
export class NotificationService {
    drawerMouseOver = false;
    private drawerState = false;
    hasCriticalError = false;
    tasks: any[] = [];

    constructor(private alert: AlertService,
                private approvalService: ApprovalService,
                private http: HttpClient,
                private userService: UserService) {
        this.userService.subscribe(() => this.reload());
    }

    clear() {
        this.tasks.length = 0;
    }

    createTask(t) {
        let abstain = _noop;
        let approve = _noop;
        let close = _noop;
        let reject = _noop;
        let task = {
            task: t,
            background: undefined,
            icon: undefined,
            name: t.name,
            properties: t.properties ? t.properties : [],
            text: t.text,
            actions: undefined,
        };
        switch (t.type) {
            case 'approval':
                switch (task.name) {
                    case 'comment':
                        task.properties.unshift({key: 'Comment', icon: 'comment'});
                        approve = () => this.approvalService.funcCommentApprove(task, () => this.reload());
                        reject = () => this.approvalService.funcCommentDecline(task, () => this.reload());
                        break;
                }
                task.background = '#d4edda';
                task.icon = 'supervisor_account';
                task.name = 'Approve';
                task.actions = [
                    {color: 'primary', icon: 'done', text: 'Approve', click: approve},
                    {color: 'warn', icon: 'clear', text: 'Reject', click: reject}
                ];
                break;
            case 'error':
                task.background = '#f8d7da';
                task.icon = 'warning';
                break;
            case 'voting':
                task.background = '#cce5ff';
                task.icon = 'done_all';
                task.actions = [
                    {color: 'primary', icon: 'thumb_up', text: 'Yes', click: approve},
                    {color: 'warn', icon: 'thumb_down', text: 'No', click: reject},
                    {color: 'accent', icon: 'thumbs_up_down', text: 'Abstain', click: abstain}
                ];
                break;
            default:
                task.background = '#d1ecf1';
                task.icon = 'assignment';
                task.actions = [{color: 'warn', icon: 'delete', text: 'Close',
                    click: () => this.tasks.splice(this.tasks.indexOf(task), 1)}];
        }
        return task;
    }

    drawer() {
        return this.drawerState;
    }

    drawerClose() {
        this.drawerState = false;
    }

    drawerOpen() {
        this.drawerState = true;
    }

    drawerToggle() {
        if (this.drawerState) {
            this.drawerClose();
        } else {
            this.drawerOpen();
        }
    }

    getIcon() {
        // notifications-off notifications-paused notifications-active
        return 'notifications-none';
    }

    reload() {
        this.http.get('/tasks/' + (window as any).version).subscribe((newTasks: any[]) => {
            this.tasks
                .filter(t => ['version', 'server', 'client'].indexOf(t.task._id) > -1)
                .forEach(t => this.tasks.splice(this.tasks.indexOf(t), 1));
            this.tasks
                .filter(task => newTasks.filter(t => task.task._id === t._id).length === 0)
                .forEach(task => this.tasks.splice(this.tasks.indexOf(task), 1));
            newTasks
                .filter(t => this.tasks.filter(task => task.task._id === t._id).length === 0)
                .forEach(t => this.tasks.push(this.createTask(t)));
            NotificationService.sortTasks(this.tasks);
            this.hasCriticalError = this.tasks.filter(t => t.task._id === 'version').length > 0;
            // this.tasks.push(NotificationService.createTask({type: 'voting', name: 'Choose', text: 'fight for you right'}));
        }, err => this.alert.addAlert('danger', err));
    }

    static sortTasks(tasks) {
        function swap(arr, i, j) {
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        let index = 0;
        ['version', 'server', 'client'].forEach(id => {
            let task = tasks.filter(t => t.task._id === id)[0];
            if (task) {
                let j = tasks.indexOf(task);
                if (j > index) {
                    swap(tasks, index, j);
                }
                index++;
            }
        });
    }
}
