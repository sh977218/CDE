import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApprovalService } from '_app/notifications/approval.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import _noop from 'lodash/noop';
import { of } from 'rxjs/observable/of';
import { zip } from 'rxjs/observable/zip';
import { elementAt, filter, map, mergeMap } from 'rxjs/operators';
import { assertUnreachable, Cb, Task } from 'shared/models.model';
import { partition } from 'shared/system/util';

const ID_TYPES = ['version', 'server', 'client', 'system', 'user']; // in sort order

export type NotificationTask = {
    actions: {color: string, icon: string, text: string, click: Cb}[],
    background: string,
    icon: string,
    name: string,
    properties: {key: string, icon?: string, link?: string, linkParams?: any}[],
    tasks: Task[],
    text?: string,
};

function tasksEqual(l: Task, r: Task) {
    return l.idType === r.idType && l.id === r.id;
}

@Injectable()
export class NotificationService {
    drawerMouseOver = false;
    private drawerState = false;
    hasCriticalError = false;
    tasks: NotificationTask[] = [];

    constructor(private alert: AlertService,
                private approvalService: ApprovalService,
                private http: HttpClient,
                private router: Router,
                private userService: UserService) {
        this.userService.subscribe(() => this.reload());
    }

    clear() {
        this.tasks.length = 0;
    }

    createTask(t: Task[], name?: string) {
        let abstain = _noop;
        let approve = _noop;
        let reject = _noop;
        let task: NotificationTask = {
            actions: undefined,
            background: undefined,
            icon: undefined,
            name: name || t[0].name,
            properties: t[0].properties && t[0].properties.concat() || [],
            tasks: t,
            text: t[0].text ? (t[0].text.length < 150 ? t[0].text : t[0].text.slice(0, 150) + '...') : undefined,
        };
        switch (t[0].type) {
            case 'approve': // idType: comment, commentReply
                switch (task.tasks[0].idType) {
                    case 'comment':
                    case 'commentReply':
                        task.properties.unshift({key: 'Comment', icon: 'comment'});
                        approve = () => this.approvalService.funcCommentApprove(task, () => this.reload());
                        reject = () => this.approvalService.funcCommentDecline(task, () => this.reload());
                        break;
                }
                task.actions = [
                    {color: 'primary', icon: 'done', text: 'Approve', click: approve},
                    {color: 'warn', icon: 'clear', text: 'Reject', click: reject}
                ];
                task.background = '#d4edda';
                task.icon = 'supervisor_account';
                task.name = 'Approve';
                break;
            case 'error': // idType: version
                task.background = '#f8d7da';
                task.icon = 'warning';
                break;
            case 'vote': // idType:
                task.actions = [
                    {color: 'primary', icon: 'thumb_up', text: 'Yes', click: approve},
                    {color: 'warn', icon: 'thumb_down', text: 'No', click: reject},
                    {color: 'accent', icon: 'thumbs_up_down', text: 'Abstain', click: abstain}
                ];
                task.background = '#cce5ff';
                task.icon = 'done_all';
                break;
            case 'message': // idType: client comment commentReply server
            default: // idType: *
                task.actions = [];
                if (!task.tasks[0].properties || !task.tasks[0].properties.filter(p => ['Audit Client Errors', 'Audit Server Errors'].includes(p.key)).length) {
                    task.actions.push({
                        color: 'warn', icon: 'delete', text: 'Close',
                        click: this.deleteTask.bind(this, task)
                    });
                }
                let filtered = task.tasks[0].properties && task.tasks[0].properties.filter(
                    p => ['Audit Client Errors', 'Audit Server Errors', 'Cde', 'Form'].includes(p.key));
                if (!!filtered && !!filtered.length) {
                    task.actions.unshift({
                        click: () => {
                            this.router.navigate([filtered[0].link], {queryParams: filtered[0].linkParams});
                            this.deleteTask(task);
                            this.drawerClose();
                        },
                        color: 'primary',
                        icon: 'open_in_browser',
                        text: 'Open',
                    });
                }
                task.background = '#d1ecf1';
                task.icon = 'assignment';
        }
        return task;
    }

    deleteTask(task: NotificationTask) {
        this.tasks.splice(this.tasks.indexOf(task), 1);
        let source = task.tasks[0].source;
        switch (source) {
            case 'calculated':
                break;
            case 'user':
                this.http.delete<Task[]>('/server/user/tasks?ids=' + task.tasks.map(t => t.id).join(','))
                    .subscribe(tasks => {
                        if (this.userService.user) {
                            this.userService.user.tasks = tasks;
                            this.tasks = NotificationService.sortTasks(
                                this.groupTasks(
                                    this.reloadUserTasks()
                                )
                            );
                        }
                    });
                break;
            default:
                assertUnreachable(source);
        }
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

    groupTasks(tasks: NotificationTask[]): NotificationTask[] {
        let grouped = tasks.concat();

        // user comments on same item
        let groups = {};
        tasks
            .filter(task => task.tasks[0].source === 'user' && ['comment', 'commentReply'].includes(task.tasks[0].idType))
            .map(task => {
                let property = task.tasks[0].properties.filter(p => ['Cde', 'Form'].includes(p.key))[0];
                if (property && property.value) {
                    let key = property.key + ' - ' + property.value;
                    groups[key] = (groups[key] || 0) + 1;
                }
            });
        for (let group in groups) {
            if (groups.hasOwnProperty(group) && groups[group] > 1) {
                let eltTasks;
                let [key, tinyId] = group.split(' - ');
                [eltTasks, grouped] = partition(grouped, task =>
                    !!task.tasks[0].properties && !!task.tasks[0].properties.filter(p => p.key === key && p.value === tinyId).length);
                grouped.push(
                    this.createTask(
                        eltTasks.reduce((acc, t) => acc.concat(t.tasks), []),
                        groups[group] + ' new comments'
                    )
                );
            }
        }

        return grouped;
    }

    mergeTaskMessages(acc: NotificationTask[], t: Task): NotificationTask[] {
        acc.push(this.tasks.filter(task => tasksEqual(task.tasks[0], t))[0] || this.createTask([t]));
        return acc;
    }

    reload() {
        zip(
            this.http.get<Task[]>('/tasks/' + (window as any).version).pipe(
                map(serverTasks => serverTasks.reduce(this.mergeTaskMessages.bind(this), []))
            ),
            of(this.userService.user).pipe(
                filter(user => !!user),
                mergeMap(() => this.http.get<Task[]>('/server/user/tasks')),
                map(userTasks => this.userService.user.tasks = userTasks),
                elementAt(0, undefined)
            )
        ).subscribe(([serverTasks]) => {
            this.tasks = NotificationService.sortTasks(
                this.groupTasks(
                    this.reloadUserTasks(
                        serverTasks
                    )
                )
            );
            this.hasCriticalError = this.tasks.filter(t => t.tasks[0].idType === 'version').length > 0;
        }, _noop);
    }

    reloadUserTasks(tasks: NotificationTask[] = undefined): NotificationTask[] {
        return this.userService.user && Array.isArray(this.userService.user.tasks)
            ? this.userService.user.tasks.reduce(this.mergeTaskMessages.bind(this), tasks
                || this.tasks.filter(t => t.tasks[0].source !== 'user'))
            : tasks || this.tasks;
    }

    static sortTasks(tasks: NotificationTask[]): NotificationTask[] {
        let size = ID_TYPES.length;
        let arrays: NotificationTask[][] = Array(size + 1);
        for (let i = 0; i < size + 1; i++) arrays[i] = [];
        tasks.forEach(task => {
            let i = ID_TYPES.indexOf(task.tasks[0].idType);
            arrays[i >= 0 && i < size ? i : size].push(task);
        });
        return [].concat(...arrays);
    }
}
