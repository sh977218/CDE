import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { DataElementViewService } from 'cde/public/components/dataElementView.service';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import _cloneDeep from 'lodash/cloneDeep';
import _noop from 'lodash/noop';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Observable } from 'rxjs';
import { Comment, Elt } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { checkPvUnicity, checkDefinitions } from 'shared/de/dataElement.model';
import { canEditCuratedItem, isOrgCurator, isOrgAuthority } from 'shared/system/authorizationShared';
import { SaveModalComponent } from 'adminItem/public/components/saveModal/saveModal.component';

@Component({
    selector: 'cde-data-element-view',
    templateUrl: 'dataElementView.component.html',
    styles: [`
        @media (max-width: 767px) {
            .mobileViewH1 {
                font-size: 20px;
            }
        }
        .menuActionIcon {
            margin: 0 0 0 8px;
        }
        .menuActionIcon:hover {
            font-weight: bold;
        }
    `],
    providers: []
})
export class DataElementViewComponent implements OnInit {
    @ViewChild('commentAreaComponent', {static: true}) commentAreaComponent!: DiscussAreaComponent;
    @ViewChild('copyDataElementContent', {static: true}) copyDataElementContent!: TemplateRef<any>;
    @ViewChild('saveModal', {static: false}) saveModal!: SaveModalComponent;
    commentMode?: boolean;
    currentTab = 'general_tab';
    displayStatusWarning?: boolean;
    draftSaving?: Promise<DataElement>;
    elt!: DataElement;
    eltCopy?: DataElement;
    hasComments = false;
    hasDrafts = false;
    highlightedTabs: string[] = [];
    isOrgCurator = isOrgCurator;
    modalRef?: MatDialogRef<TemplateRef<any>>;
    tabsCommented: string[] = [];
    savingText = '';
    unsaved = false;
    validationErrors: { message: string }[] = [];

    ngOnInit() {
        this.orgHelperService.then(() => {
            this.route.queryParams.subscribe(() => {
                this.hasDrafts = false;
                this.loadElt(() => {
                    this.elt.usedBy = this.orgHelperService.getUsedBy(this.elt);
                });
            });
        }, _noop);
    }

    constructor(private alert: AlertService,
                private deViewService: DataElementViewService,
                private dialog: MatDialog,
                private http: HttpClient,
                private orgHelperService: OrgHelperService,
                public quickBoardService: QuickBoardListService,
                private ref: ChangeDetectorRef,
                private route: ActivatedRoute,
                private router: Router,
                private title: Title,
                public userService: UserService) {
    }

    canEdit() {
        return canEditCuratedItem(this.userService.user, this.elt);
    }

    eltLoad(getElt: Observable<DataElement> | Promise<DataElement> | DataElement, cb = _noop) {
        if (getElt instanceof Observable) {
            getElt.subscribe(
                elt => this.eltLoaded(elt, cb),
                () => this.router.navigate(['/pageNotFound'], {skipLocationChange: true})
            );
        } else if (getElt instanceof Promise) {
            getElt.then(
                elt => this.eltLoaded(elt, cb),
                () => this.router.navigate(['/pageNotFound'], {skipLocationChange: true})
            );
        } else {
            this.eltLoaded(getElt, cb);
        }
    }

    eltLoaded(elt: DataElement, cb = _noop) {
        if (elt) {
            if (elt.isDraft) { this.hasDrafts = true; }
            DataElement.validate(elt);
            this.elt = elt;
            this.title.setTitle('Data Element: ' + Elt.getLabel(this.elt));
            this.validate();
            this.loadComments(this.elt);
            if (this.userService.user) {
                checkPvUnicity(this.elt.valueDomain);
            }
            this.displayStatusWarning = (() => {
                if (!this.elt || this.elt.archived || this.userService.user && isOrgAuthority(this.userService.user)) {
                    return false;
                }
                return isOrgCurator(this.userService.user, this.elt.stewardOrg.name) &&
                    (this.elt.registrationState.registrationStatus === 'Standard' ||
                        this.elt.registrationState.registrationStatus === 'Preferred Standard');
            })();
            cb();
        }
    }

    loadComments(de: DataElement, cb = _noop) {
        this.http.get<Comment[]>('/server/discuss/comments/eltId/' + de.tinyId)
            .subscribe(res => {
                this.hasComments = res && (res.length > 0);
                this.tabsCommented = res.map(c => c.linkedTab + '_tab');
                cb();
            }, err => this.alert.httpErrorMessageAlert(err, 'Error loading comments.'));
    }

    loadElt(cb = _noop) {
        this.eltLoad(this.deViewService.fetchEltForEditing(this.route.snapshot.queryParams), cb);
    }

    loadHighlightedTabs($event: string[]) {
        this.highlightedTabs = $event;
    }

    loadPublished(cb = _noop) {
        this.eltLoad(this.deViewService.fetchPublished(this.route.snapshot.queryParams), cb);
    }

    publish() {
        if (this.validationErrors.length) {
            this.alert.addAlert('danger', 'Please fix all errors before publishing');
        } else {
            this.saveModal.openSaveModal();
        }
    }

    openCopyElementModal() {
        this.eltCopy = _cloneDeep(this.elt);
        this.eltCopy.classification =  this.elt.classification
            && this.elt.classification.filter(c => this.userService.userOrgs.indexOf(c.stewardOrg.name) !== -1);
        this.eltCopy.registrationState.administrativeNote = 'Copy of: ' + this.elt.tinyId;
        delete this.eltCopy.tinyId;
        delete this.eltCopy._id;
        delete this.eltCopy.origin;
        delete this.eltCopy.created;
        delete this.eltCopy.updated;
        delete this.eltCopy.imported;
        delete this.eltCopy.updatedBy;
        delete this.eltCopy.createdBy;
        delete this.eltCopy.version;
        delete this.eltCopy.history;
        delete this.eltCopy.changeNote;
        delete this.eltCopy.comments;
        delete this.eltCopy.forkOf;
        delete this.eltCopy.views;
        this.eltCopy.ids = [];
        this.eltCopy.sources = [];
        this.eltCopy.designations[0].designation = 'Copy of: ' + this.eltCopy.designations[0].designation;
        this.eltCopy.registrationState = {
            registrationStatus: 'Incomplete',
            administrativeNote: 'Copy of: ' + this.elt.tinyId
        };
        this.modalRef = this.dialog.open(this.copyDataElementContent, {width: '1200px'});
    }

    setCurrentTab(currentTab: string) {
        this.currentTab = currentTab;
    }

    removeAttachment(index: number) {
        this.http.post<DataElement>('/server/attachment/cde/remove', {
            index,
            id: this.elt._id
        }).subscribe(res => {
            this.elt = res;
            this.alert.addAlert('success', 'Attachment Removed.');
            this.ref.detectChanges();
        });
    }

    setDefault(index: number) {
        this.http.post<DataElement>('/server/attachment/cde/setDefault',
            {
                index,
                state: this.elt.attachments[index].isDefault,
                id: this.elt._id
            }).subscribe(res => {
            this.elt = res;
            this.alert.addAlert('success', 'Saved');
            this.ref.detectChanges();
        });
    }

    upload(event: Event) {
        if (event.srcElement) {
            const files = (event.srcElement as HTMLInputElement).files;
            if (files && files.length > 0) {
                const formData = new FormData();
                /* tslint:disable */
                for (let i = 0; i < files.length; i++) {
                    formData.append('uploadedFiles', files[i]);
                }
                /* tslint:enable */
                formData.append('id', this.elt._id);
                this.http.post<any>('/server/attachment/cde/add', formData).subscribe(
                    r => {
                        if (r.message) {
                            this.alert.addAlert('info', r);
                        } else {
                            this.elt = r;
                            this.alert.addAlert('success', 'Attachment added.');
                            this.ref.detectChanges();
                        }
                    }
                );
            }
        }
    }

    removeDraft() {
        this.http.delete('/server/cde/draftDataElement/' + this.elt.tinyId, {responseType: 'text'}).subscribe(
            () => this.loadElt(() => this.hasDrafts = false),
            err => this.alert.httpErrorMessageAlert(err)
        );
    }

    saveDraft(): Promise<any> {
        if (!this.elt.isDraft) {
            this.elt.changeNote = '';
        }
        this.elt.isDraft = true;
        this.hasDrafts = true;
        this.savingText = 'Saving ...';
        if (this.draftSaving) {
            this.unsaved = true;
            return this.draftSaving;
        }
        return this.draftSaving = this.http.put<DataElement>('/server/cde/draftDataElement/' + this.elt.tinyId, this.elt)
            .toPromise().then(newElt => {
                this.draftSaving = undefined;
                this.elt.__v = newElt.__v;
                this.validate();
                if (this.unsaved) {
                    this.unsaved = false;
                    return this.saveDraft();
                }
                this.savingText = 'Saved';
                setTimeout(() => {
                    this.savingText = '';
                }, 3000);
            }, err => {
                this.draftSaving = undefined;
                this.savingText = 'Cannot save this old version. Reload and redo.';
                this.alert.httpErrorMessageAlert(err);
                throw err;
            });
    }

    saveDraftVoid(): void {
        this.saveDraft().catch(_noop);
    }

    saveDataElement() {
        const saveImpl = () => {
            const publishData = {_id: this.elt._id, tinyId: this.elt.tinyId, __v: this.elt.__v};
            this.http.post('/server/cde/dePublish', publishData).subscribe(res => {
                if (res) {
                    this.hasDrafts = false;
                    this.loadElt(() => this.alert.addAlert('success', 'Data Element saved.'));
                }
            }, err => this.alert.httpErrorMessageAlert(err, 'Error publishing'));
        };

        if (this.draftSaving) {
            this.draftSaving.then(saveImpl, _noop);
        } else {
            saveImpl();
        }
    }

    validate() {
        this.validationErrors.length = 0;
        const defError = checkDefinitions(this.elt);
        if (!defError.allValid) {
            // @ts-ignore
            this.validationErrors.push({message: defError.message});
        }
        const pvErrors = checkPvUnicity(this.elt.valueDomain);
        if (!pvErrors.allValid) {
            // @ts-ignore
            this.validationErrors.push({message: pvErrors.message});
        }
    }

    viewChanges() {
        const draft = this.elt;
        this.deViewService.fetchPublished(this.route.snapshot.queryParams).then(published => {
            this.dialog.open(CompareHistoryContentComponent,
                {width: '1000px', data: {newer: draft, older: published}});
        }, err => this.alert.httpErrorMessageAlert(err, 'Error loading view changes.'));
    }
}
