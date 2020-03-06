import { HttpClient } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';
import { ApprovalService } from '_app/notifications/approval.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import _noop from 'lodash/noop';
import { assertUnreachable, Cb, Task, TASK_STATE_UNREAD } from 'shared/models.model';
import { partition } from 'shared/system/util';
import { Dictionary } from 'async';
import { MatDialog } from '@angular/material/dialog';

const TYPES = ['error', 'approve', 'vote', 'message', 'comment']; // in sort order

export interface NotificationTask {
    actions: {color: string, icon: string, text: string, click: Cb}[];
    background: string;
    icon: string;
    name: string;
    properties: {key: string, icon?: string, link?: string, linkParams?: any}[];
    tasks: Task[];
    text?: string;
    unread: boolean;
    url?: string;
    urlLink?: string;
    urlQueryParams?: Params;
}

function tasksEqualAndState(l: Task, r: Task): {state?: number} | undefined {
    if (l.id !== r.id || l.idType !== r.idType) {
        return undefined;
    }
    if (l.type === 'comment' && r.type === 'comment' && ['cde', 'form'].includes(l.idType)) {
        const same = l.date === r.date && l.name === r.name && l.text === r.text;
        if (same) {
            l.state = r.state;
            return {state: r.state};
        }
        return same ? {} : undefined;
    }
    return {};
}

@Injectable()
export class NotificationService {

    constructor(private alert: AlertService,
                private approvalService: ApprovalService,
                private http: HttpClient,
                private dialog: MatDialog,
                private router: Router,
                private userService: UserService) {
        this.userService.subscribe(this.funcReload);
    }
    drawerMouseOver = false;
    private drawerState = false;
    funcMergeTaskMessages = this.mergeTaskMessages.bind(this);
    funcReload = this.reload.bind(this);
    funcReloadFinished = this.reloadFinished.bind(this);
    funcUpdateTaskMessages = this.updateTaskMessages.bind(this);
    hasCriticalError = false;
    reloading = false;
    tasks: NotificationTask[] = [];

    authorizeToComment(username: string) {
        this.http.post('/server/user/addCommentAuthor', {username}).subscribe(() => {
            this.alert.addAlert('success', 'Role added.');
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    clear() {
        this.tasks.length = 0;
    }

    createTask(tasks: Task[], name?: string) {
        const abstain = _noop;
        let approve = _noop;
        let reject = _noop;
        const t0 = tasks[0];
        let task: NotificationTask;
        name = name || t0.name;
        const properties = t0.properties && t0.properties.concat() || [];
        const text = t0.text ? (t0.text.length < 150 ? t0.text : t0.text.slice(0, 150) + '...') : undefined;
        const unread = !!(t0.state === undefined || TASK_STATE_UNREAD & t0.state);
        const url = t0.url;
        switch (t0.type) {
            case 'approve': // idType: comment, commentReply
                task = {
                    actions: [],
                    background: '#d4edda',
                    icon: 'supervisor_account',
                    name: 'Approve',
                    properties,
                    tasks,
                    text,
                    unread,
                    url,
                };
                switch (t0.idType) {
                    case 'attachment':
                        task.properties.unshift({key: 'Attachment', icon: 'attach_file'});
                        approve = () => this.approvalService.funcAttachmentApprove(task, this.funcReload);
                        reject = () => this.approvalService.funcAttachmentDecline(task, this.funcReload);
                        break;
                    case 'comment':
                    case 'commentReply':
                        task.properties.unshift({key: 'Comment', icon: 'comment'});
                        approve = () => this.approvalService.funcCommentApprove(task, this.funcReload);
                        reject = () => this.approvalService.funcCommentDecline(task, this.funcReload);
                        const userProp = task.tasks[0].properties.filter(p => p.key === 'User')[0];
                        if (userProp && userProp.value) {
                            const username = userProp.value;
                            task.actions.push({
                                color: 'accent', icon: 'person_add', text: 'Authorize', click: () => {
                                    this.dialog.open(CommentAuthorizeUserComponent).afterClosed().subscribe(result => {
                                        if (result === 'Authorize') {
                                            this.authorizeToComment(username);
                                            this.approvalService.commentApprove(task, this.funcReload);
                                        }
                                    });
                                }
                            });
                        }
                        break;
                }
                task.actions.push({color: 'primary', icon: 'done', text: 'Approve', click: approve});
                task.actions.push({color: 'warn', icon: 'clear', text: 'Reject', click: reject});
                break;
            case 'error': // idType: version
                task = {
                    actions: [],
                    background: '#f8d7da',
                    icon: 'error',
                    name,
                    properties,
                    tasks,
                    text,
                    unread,
                    url,
                };
                switch (t0.idType) {
                    case 'versionUpdate':
                        task.icon = 'new_releases';
                        break;
                }
                break;
            case 'vote': // idType:
                task = {
                    actions: [
                        {color: 'primary', icon: 'thumb_up', text: 'Yes', click: approve},
                        {color: 'warn', icon: 'thumb_down', text: 'No', click: reject},
                        {color: 'accent', icon: 'thumbs_up_down', text: 'Abstain', click: abstain}
                    ],
                    background: '#cce5ff',
                    icon: 'done_all',
                    name,
                    properties,
                    tasks,
                    text,
                    unread,
                    url,
                };
                break;
            case 'comment':
                // TODO: read/unread impl
                task = {
                    actions: [],
                    background: '#d1ecf1',
                    icon: 'question_answer',
                    name,
                    properties,
                    tasks,
                    text,
                    unread,
                    url,
                };
                break;
            case 'message':
            default:
                task = {
                    actions: [],
                    background: '#d1ecf1',
                    icon: 'assignment',
                    name,
                    properties,
                    tasks,
                    text,
                    unread,
                    url,
                };
                switch (t0.idType) {
                    case 'clientError':
                    case 'serverError':
                        // TODO: close impl
                        task.icon = 'warning';
                        break;
                }
        }
        if (task.url) {
            const urlTree = this.router.parseUrl(task.url);
            task.urlLink = '/' + urlTree.root.children.primary.segments.join('/');
            task.urlQueryParams = urlTree.queryParams;
        }
        return task as NotificationTask;
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

    getBadge(): number {
        return this.tasks.filter(task => task.unread).length;
    }

    getIcon(): string {
        // notifications-off notifications-paused notifications-none
        return this.hasCriticalError ? 'notifications_active' : 'notifications';
    }

    groupTasks(tasks: NotificationTask[]): NotificationTask[] {
        let grouped = tasks.concat();

        // user comments on same item
        const groups: Dictionary<number> = {};
        tasks
            .filter(task => task.tasks[0].source === 'user' && task.tasks[0].type === 'comment')
            .forEach(task => {
                const key = task.tasks[0].idType + ' - ' + task.tasks[0].id;
                groups[key] = (groups[key] || 0) + 1;
            });
        for (const group in groups) {
            if (groups.hasOwnProperty(group) && groups[group] > 1) {
                let eltTasks;
                const [eltModule, eltTinyId] = group.split(' - ');
                [eltTasks, grouped] = partition(grouped, task => task.tasks[0].id === eltTinyId
                    && task.tasks[0].source === 'user' && task.tasks[0].type === 'comment'
                    && task.tasks[0].idType === eltModule);
                grouped.push(
                    this.createTask(
                        // @ts-ignore
                        eltTasks.reduce<Task[]>((acc, t) => acc.concat(t.tasks), []),
                        groups[group] + ' comments'
                    )
                );
            }
        }

        return grouped;
    }

    mergeTaskMessages(acc: NotificationTask[], t: Task): NotificationTask[] {
        let unread = false;
        const match = this.tasks.filter(task => !!task.tasks.filter(i => {
            const stateObj = tasksEqualAndState(i, t);
            if (stateObj && stateObj.state) {
                unread = unread || !!(stateObj.state & TASK_STATE_UNREAD);
            }
            return !!stateObj;
        }).length);
        if (match.length) {
            if (acc.indexOf(match[0]) === -1) {
                acc.push(match[0]);
            }
            if (unread !== undefined) {
                match[0].unread = match[0].unread || unread;
            }
        } else {
            acc.push(this.createTask([t]));
        }
        return acc;
    }

    readTask(task: NotificationTask) {
        const source = task.tasks[0].source;
        switch (source) {
            case 'calculated':
                break;
            case 'user':
                if (task.tasks[0].type === 'comment' && task.unread) {
                    task.unread = false;
                    this.reloading = true;
                    this.http.post<NotificationTask[]>('/server/user/tasks/' + (window as any).version + '/read',
                        {id: task.tasks[0].id, idType: task.tasks[0].idType})
                        .subscribe(this.funcUpdateTaskMessages, this.funcReloadFinished, this.funcReloadFinished);
                }
                break;
            default:
                throw assertUnreachable(source);
        }
    }

    reload() {
        if (!this.reloading) {
            this.reloading = true;
            this.http.get<NotificationTask[]>('/server/user/tasks/' + (window as any).version)
                .subscribe(this.funcUpdateTaskMessages, this.funcReloadFinished, this.funcReloadFinished);
        }
    }

    reloadFinished() {
        this.reloading = false;
    }

    updateTaskMessages(serverTasks: NotificationTask[]) {
        if (serverTasks && serverTasks.reduce) {
            this.tasks = NotificationService.sortTasks(
                this.groupTasks(
                    // @ts-ignore
                    serverTasks.reduce(this.funcMergeTaskMessages, [])
                )
            );
            this.hasCriticalError = this.tasks.filter(t => t.tasks[0].idType === 'versionUpdate').length > 0;
        }
    }

    static sortTasks(tasks: NotificationTask[]): NotificationTask[] {
        return tasks.sort((a: NotificationTask, b: NotificationTask) => {
            if (TYPES.indexOf(a.tasks[0].type) !== TYPES.indexOf(b.tasks[0].type)) {
                return TYPES.indexOf(a.tasks[0].type) - TYPES.indexOf(b.tasks[0].type);
            } else {
                return new Date(a.tasks[0].date).getTime() - new Date(b.tasks[0].date).getTime();
            }
        });
    }
}

@Component({
    template: `
        <h3 mat-dialog-title>Please confirm</h3>
        <div mat-dialog-content>
            The user will be able to post comments without an approval.<br>
            Do you want to proceed?
        </div>
        <div mat-dialog-actions>
            <button mat-raised-button color="accent" mat-dialog-close>No</button>
            <button id="authorizeUserOK" mat-raised-button mat-dialog-close="Authorize">Yes</button>
        </div>
    `,
})
export class CommentAuthorizeUserComponent {}
