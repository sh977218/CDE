import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, Inject, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { SaveModalComponent } from 'adminItem/saveModal/saveModal.component';
import { ScrollService } from 'angular-aio-toc/scroll.service';
import { TocService } from 'angular-aio-toc/toc.service';
import { DataElementViewService } from 'cde/public/components/dataElementView/dataElementView.service';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import * as _cloneDeep from 'lodash/cloneDeep';
import * as _noop from 'lodash/noop';
import { ExportService } from 'non-core/export.service';
import { LocalStorageService } from 'non-core/localStorage.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Observable } from 'rxjs';
import { Comment, Elt } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { checkPvUnicity, checkDefinitions } from 'shared/de/dataElement.model';
import {
    canEditCuratedItem,
    isOrgCurator,
    isOrgAuthority,
    hasPrivilegeForOrg
} from 'shared/system/authorizationShared';
import { WINDOW } from 'window.service';

const TAB_COMMENT_MAP: any = {
    general: 'general-details',
    pv: 'permissible-values',
    naming: 'naming',
    classification: 'classification',
    concepts: 'concepts',
    reference_documents: 'reference-documents',
    properties: 'properties',
    identifiers: 'identifiers',
    attachments: 'attachments',
    history: 'history',
    rules: 'rules',
}

@Component({
    selector: 'cde-data-element-view',
    templateUrl: 'dataElementView.component.html',
    styleUrls: ['./view.style.scss'],
    providers: [TocService]
})
export class DataElementViewComponent implements OnDestroy, OnInit {
    @ViewChild('commentAreaComponent', {static: true}) commentAreaComponent!: DiscussAreaComponent;
    @ViewChild('copyDataElementContent', {static: true}) copyDataElementContent!: TemplateRef<any>;
    @ViewChild('saveModal') saveModal!: SaveModalComponent;
    commentMode?: boolean;
    currentTab = 'general_tab';
    displayStatusWarning?: boolean;
    draftSaving?: Promise<DataElement>;
    elt!: DataElement;
    eltCopy?: DataElement;
    exportToTab: boolean = false;
    hasDrafts = false;
    highlightedTabs: string[] = [];
    isMobile = false;
    isOrgCurator = isOrgCurator;
    modalRef?: MatDialogRef<TemplateRef<any>>;
    comments: Comment[] = [];
    savingText = '';
    unsaved = false;
    validationErrors: { message: string }[] = [];

    ngOnDestroy() {
        this.tocService.reset();
    }

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

    constructor(private route: ActivatedRoute,
                private alert: AlertService,
                private ref: ChangeDetectorRef,
                private deViewService: DataElementViewService,
                public exportService: ExportService,
                private http: HttpClient,
                private localStorageService: LocalStorageService,
                private dialog: MatDialog,
                private orgHelperService: OrgHelperService,
                public quickBoardService: QuickBoardListService,
                private router: Router,
                private scrollService: ScrollService,
                private title: Title,
                private tocService: TocService,
                public userService: UserService,
                private ngZone: NgZone,
                @Inject(WINDOW) private window: Window) {
        this.exportToTab = !!localStorageService.getItem('exportToTab');
        this.onResize();
        this.route.fragment.subscribe(() => {
            if (this.elt) {
                setTimeout(() => {
                    this.title.setTitle('Data Element: ' + Elt.getLabel(this.elt));
                    this.scrollService.scroll();
                }, 0);
            }
        });
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
            if (elt.isDraft) {
                this.hasDrafts = true;
            }
            DataElement.validate(elt);
            this.elt = elt;
            this.title.setTitle('Data Element: ' + Elt.getLabel(this.elt));
            this.validate();
            this.loadComments(this.elt, () => {
                setTimeout(() => {
                    this.viewReady();
                }, 0);
            });
            if (this.userService.user) {
                checkPvUnicity(this.elt.valueDomain);
            }
            this.displayStatusWarning = (() => {
                if (!this.elt || this.elt.archived || this.userService.user && isOrgAuthority(this.userService.user)) {
                    return false;
                }
                return hasPrivilegeForOrg(this.userService.user, 'edit', this.elt.stewardOrg.name) &&
                    (this.elt.registrationState.registrationStatus === 'Standard' ||
                        this.elt.registrationState.registrationStatus === 'Preferred Standard');
            })();
            cb();
        }
    }

    gotoTop() {
        window.scrollTo(0, 0);
        this.router.navigate([], {queryParams: this.route.snapshot.queryParams, replaceUrl: true})
    }

    loadComments(de: DataElement, cb = _noop) {
        this.http.get<Comment[]>('/server/discuss/comments/eltId/' + de.tinyId)
            .subscribe(res => {
                this.comments = res;
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

    @HostListener('window:resize', [])
    onResize() {
        this.isMobile = window.innerWidth < 768;
    }

    publish() {
        if (this.validationErrors.length) {
            this.alert.addAlert('danger', 'Please fix all errors before publishing');
        } else {
            this.saveModal.openSaveModal();
        }
    }

    openCopyElementModal() {
        const eltCopy = this.eltCopy = _cloneDeep(this.elt);
        eltCopy.classification = this.elt.classification
            && this.elt.classification.filter(c => this.userService.userOrgs.indexOf(c.stewardOrg.name) !== -1);
        eltCopy.registrationState.administrativeNote = 'Copy of: ' + this.elt.tinyId;
        delete eltCopy.tinyId;
        delete eltCopy._id;
        delete eltCopy.origin;
        delete eltCopy.created;
        delete eltCopy.updated;
        delete eltCopy.imported;
        delete eltCopy.updatedBy;
        delete eltCopy.createdBy;
        delete eltCopy.version;
        delete eltCopy.history;
        delete eltCopy.changeNote;
        delete eltCopy.comments;
        delete eltCopy.forkOf;
        delete eltCopy.views;
        eltCopy.ids = [];
        eltCopy.sources = [];
        eltCopy.designations[0].designation = 'Copy of: ' + eltCopy.designations[0].designation;
        eltCopy.registrationState = {
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
        this.http.delete('/server/de/draft/' + this.elt.tinyId, {responseType: 'text'}).subscribe(
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
        return this.draftSaving = this.http.put<DataElement>('/server/de/draft/' + this.elt.tinyId, this.elt)
            .toPromise().then(newElt => {
                this.draftSaving = undefined;
                this.elt = newElt;
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
            this.http.post('/server/de/publish', publishData).subscribe(res => {
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
        if (defError.allValid !== true) {
            this.validationErrors.push({message: defError.message});
        }
        const pvErrors = checkPvUnicity(this.elt.valueDomain);
        if (pvErrors.allValid !== true) {
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

    viewReady(): void {
        let path = this.router.url;
        const loc = path.indexOf('#');
        if (loc !== -1) {
            path = path.substr(0, loc);
        }
        this.tocService.genToc(document.getElementsByTagName('main')[0], path);
        // this.scrollService.scrollAfterRender(0);
        this.scrollService.scroll();
    }
}
