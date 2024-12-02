import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { fileInputToFormData } from 'non-core/browser';
import {
    AttachmentAttachResponse,
    AttachmentDetachRequest,
    HomepageDraftGetResponse,
    HomepageDraftPutRequest,
    HomepageDraftPutResponse,
    HomepageGetResponse,
    HomepagePutRequest,
    HomepagePutResponse,
} from 'shared/boundaryInterfaces/API/system';
import { toPromise } from 'shared/observable';
import { HomePageDraft, UpdateCard } from 'shared/singleton.model';
import { isT } from 'shared/util';

@Component({
    templateUrl: './homeEdit.component.html',
    styleUrls: ['./homeEdit.component.scss'],
})
export class HomeEditComponent {
    autoSaveLock: boolean = false;
    autoSaveWait: HomePageDraft | null = null;
    editing: boolean = false;
    homepage?: HomePageDraft;
    noDraft: boolean = false;
    timestampExpire?: number;

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        private router: Router,
        private userService: UserService
    ) {
        this.refresh();
    }

    attachmentDelete(fileId: string): Promise<void> {
        return toPromise(
            this.http.post<void>('/server/homeDetach', {
                fileId,
            } as AttachmentDetachRequest)
        );
    }

    attachmentUpload(homepage: HomePageDraft, updateCard: UpdateCard, event: Event) {
        const formData = fileInputToFormData(event.srcElement as HTMLInputElement);
        if (formData) {
            this.http.post<AttachmentAttachResponse>('/server/homeAttach', formData).subscribe(r => {
                updateCard.image = {
                    fileId: r.fileId,
                    uploadedBy: this.userService.user?._id,
                };
                this.autoSave(homepage);
            });
        }
    }

    autoSave(homepage: HomePageDraft) {
        if (this.autoSaveLock) {
            this.autoSaveWait = homepage;
            return;
        }
        this.autoSaveLock = true;
        toPromise(
            this.http.put<HomepageDraftPutResponse>('/server/homeEdit', {
                updated: homepage.updated,
                updateInProgress: true,
                body: {
                    updates: homepage.body.updates,
                },
            } as HomepageDraftPutRequest)
        ).then(
            newHomepage => {
                homepage.updated = newHomepage.updated;
                homepage.updatedBy = newHomepage.updatedBy;
                this.autoSaveLock = false;
                if (this.autoSaveWait) {
                    this.autoSave(this.autoSaveWait);
                    this.autoSaveWait = null;
                }
            },
            err => {
                this.autoSaveLock = false;
                this.alert.httpErrorAlert(err);
            }
        );
    }

    deleteDraft() {
        Promise.all([
            toPromise(this.http.get<HomepageDraftGetResponse>('/server/homeEdit')),
            toPromise(this.http.get<HomepageGetResponse>('/server/home')),
        ])
            .then(drafts => {
                const [draft, original] = drafts;
                if (draft) {
                    const keepIds = (original ? original.body.updates : []).map(u => u.image?.fileId).filter(isT);
                    return Promise.all(
                        draft.body.updates.map(u => {
                            if (u.image && !keepIds.includes(u.image.fileId)) {
                                return this.attachmentDelete(u.image.fileId);
                            }
                        })
                    );
                }
            })
            .then(() => toPromise(this.http.delete('/server/homeEdit')))
            .then(() => this.router.navigate(['/home']))
            .catch(err => this.alert.httpErrorAlert(err));
    }

    deleteImage(update: UpdateCard): Promise<void> {
        return Promise.resolve()
            .then(() => {
                const fileId = update.image?.fileId;
                if (fileId) {
                    toPromise(this.http.get<HomepageGetResponse>('/server/home')).then(original => {
                        if ((original ? original.body.updates : []).every(u => u.image?.fileId !== fileId)) {
                            return this.attachmentDelete(fileId);
                        }
                    });
                }
            })
            .then(() => {
                update.image = undefined;
            });
    }

    deleteUpdate(homepage: HomePageDraft, update: UpdateCard) {
        this.deleteImage(update).then(() => {
            homepage.body.updates.splice(homepage.body.updates.indexOf(update), 1);
            this.autoSave(homepage);
        });
    }

    editable() {
        return !this.homepage?.updateInProgress && this.homepage?.updatedBy === this.userService.user;
    }

    editLockAvailable() {
        return (
            this.homepage?.updatedBy === this.userService.user?._id ||
            (this.timestampExpire && this.timestampExpire < Date.now())
        );
    }

    getEditLock(homepage: HomePageDraft) {
        toPromise(
            this.http.put<HomepageDraftPutResponse>('/server/homeEdit', {
                updated: homepage.updated,
                updateInProgress: true,
            } as HomepageDraftPutRequest)
        ).then(
            newHomepage => {
                homepage.updated = newHomepage.updated;
                homepage.updatedBy = newHomepage.updatedBy;
                this.editing = true;
            },
            err => this.alert.httpErrorAlert(err)
        );
    }

    lockedByMe() {
        return this.homepage?.updatedBy === this.userService.user?._id;
    }

    postLoad(homepage: HomePageDraft) {
        this.timestampExpire = homepage.updated + 1800000; // add 30 minutes
        this.editing =
            this.noDraft || (!homepage.updateInProgress && homepage.updatedBy === this.userService.user?._id);
        if (!Array.isArray(homepage.body.updates)) {
            homepage.body.updates = [];
        }
        this.homepage = homepage;
    }

    publish(homepage: HomePageDraft) {
        toPromise(this.http.get<HomepageGetResponse>('/server/home')).then(original => {
            return toPromise(
                this.http.put<HomepageDraftPutResponse>('/server/homeEdit', homepage as HomepageDraftPutRequest)
            )
                .then(newHomepage => {
                    homepage.updated = newHomepage.updated;
                    homepage.updatedBy = newHomepage.updatedBy;
                    // homepage.updateInProgress = undefined;
                })
                .then(() =>
                    toPromise(this.http.put<HomepagePutResponse>('/server/home', homepage as HomepagePutRequest))
                )
                .then(() => toPromise(this.http.delete('/server/homeEdit')))
                .then(() =>
                    Promise.all(
                        (original ? original.body.updates : [])
                            .map(u => u.image?.fileId)
                            .filter(isT)
                            .filter(fileId => homepage.body.updates.every(u => u.image?.fileId !== fileId))
                            .map(fileId => this.attachmentDelete(fileId))
                    )
                )
                .then(() => this.router.navigate(['/home']))
                .catch(err => this.alert.httpErrorAlert(err));
        });
    }

    refresh() {
        toPromise(this.http.get<HomepageDraftGetResponse>('/server/homeEdit')).then(
            homepage => {
                if (homepage) {
                    this.noDraft = false;
                    this.postLoad(homepage);
                    return;
                }
                toPromise(this.http.get<HomepageGetResponse>('/server/home')).then(
                    homepage => {
                        this.noDraft = true;
                        if (!homepage) {
                            homepage = {
                                updated: Date.now(),
                                updatedBy: this.userService.user?._id,
                                body: {
                                    updates: [],
                                },
                            };
                        }
                        this.postLoad(homepage);
                    },
                    err => this.alert.httpErrorAlert(err)
                );
            },
            err => this.alert.httpErrorAlert(err)
        );
    }

    stopEditing(homepage: HomePageDraft) {
        toPromise(
            this.http.put<HomepageDraftPutResponse>('/server/homeEdit', {
                updated: homepage.updated,
                updateInProgress: false,
            } as HomepageDraftPutRequest)
        ).then(
            newHomepage => {
                if (newHomepage) {
                    homepage.updated = newHomepage.updated;
                    homepage.updatedBy = newHomepage.updatedBy;
                }
                this.router.navigate(['/home']);
            },
            err => this.alert.httpErrorAlert(err)
        );
    }

    waitTimeInMinutes(timestampExpire: number) {
        return Math.round((timestampExpire - Date.now()) / 60000);
    }
}
