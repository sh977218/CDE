import { HttpClient } from '@angular/common/http';
import {
    AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, NgZone, OnInit, TemplateRef,
    ViewChild
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { SaveModalComponent } from 'adminItem/saveModal/saveModal.component';
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
import { canEditCuratedItem, isOrgCurator, isOrgAuthority } from 'shared/system/authorizationShared';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { WINDOW } from 'window.service';

const TAB_COMMENT_MAP: any = {
    general: 'general_details_tab',
    pv: 'permissible_values_tab',
    naming: 'naming_tab',
    classification: 'classification_tab',
    concepts: 'concepts_tab',
    reference_documents: 'reference_documents_tab',
    properties: 'properties_tab',
    identifiers: 'identifiers_tab',
    attachments: 'attachments_tab',
    history: 'history_tab',
    rules: 'rules_tab'
}

@Component({
    selector: 'cde-data-element-view',
    templateUrl: 'dataElementView.component.html',
    styleUrls: ['./view.style.scss'],
    providers: []
})
export class DataElementViewComponent implements OnInit, AfterViewInit {
    @ViewChild('commentAreaComponent', {static: true}) commentAreaComponent!: DiscussAreaComponent;
    @ViewChild('copyDataElementContent', {static: true}) copyDataElementContent!: TemplateRef<any>;
    @ViewChild('saveModal') saveModal!: SaveModalComponent;

    @ViewChild('generalDetails', {static: false}) generalDetails!: ElementRef;
    @ViewChild('permissibleValue', {static: false}) permissibleValue!: ElementRef;
    @ViewChild('naming', {static: false}) naming!: ElementRef;
    @ViewChild('classification', {static: false}) classification!: ElementRef;
    @ViewChild('concepts', {static: false}) concepts!: ElementRef;
    @ViewChild('referenceDocuments', {static: false}) referenceDocuments!: ElementRef;
    @ViewChild('properties', {static: false}) properties!: ElementRef;
    @ViewChild('identifiers', {static: false}) identifiers!: ElementRef;
    @ViewChild('attachments', {static: false}) attachments!: ElementRef;
    @ViewChild('history', {static: false}) history!: ElementRef;
    @ViewChild('rules', {static: false}) rules!: ElementRef;
    @ViewChild(MatSidenavContainer, {static: false}) matSidenavContainer!: MatSidenavContainer;
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

    sideNavItems = [
        {id: 'general_details_tab', label: 'General Details', fragment: 'general-details-div', hasComment: false},
        {
            id: 'permissible_values_tab',
            label: 'Permissible Values',
            fragment: 'permissible-values-div',
            hasComment: false
        },
        {id: 'naming_tab', label: 'Naming', fragment: 'naming-div', hasComment: false},
        {id: 'classification_tab', label: 'Classification', fragment: 'classification-div', hasComment: false},
        {id: 'concepts_tab', label: 'Concepts', fragment: 'concepts-div', hasComment: false},
        {
            id: 'reference_documents_tab',
            label: 'Reference Documents',
            fragment: 'reference-documents-div',
            hasComment: false
        },
        {id: 'properties_tab', label: 'Properties', fragment: 'properties-div', hasComment: false},
        {id: 'identifiers_tab', label: 'Identifiers', fragment: 'identifiers-div', hasComment: false},
        {id: 'attachments_tab', label: 'Attachments', fragment: 'attachments-div', hasComment: false},
        {id: 'history_tab', label: 'History', fragment: 'history-div', hasComment: false},
        {id: 'rules_tab', label: 'Rules', fragment: 'rules-div', hasComment: false},
    ];
    activeSection = '';

    // avoid highlight nav bar by scroll when user click nav bar link
    navigateByClick = false;

    previousActiveSection = '';
    generalDetailsOffsetTop = 0;
    permissibleValueOffsetTop = 0;
    namingOffsetTop = 0;
    classificationOffsetTop = 0;
    conceptsOffsetTop = 0;
    referenceDocumentsOffsetTop = 0;
    propertiesOffsetTop = 0;
    identifiersOffsetTop = 0;
    attachmentsOffsetTop = 0;
    historyOffsetTop = 0;
    rulesOffsetTop = 0;

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
                private title: Title,
                public userService: UserService,
                private ngZone: NgZone,
                @Inject(WINDOW) private window: Window) {
        this.exportToTab = !!localStorageService.getItem('exportToTab');
        this.onResize();
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
                this.comments = res;
                this.sideNavItems.forEach(sideNavItem => {
                    sideNavItem.hasComment = this.comments.filter(c => {
                        const linkedTab = TAB_COMMENT_MAP[c.linkedTab];
                        return sideNavItem.id === linkedTab;
                    }).length > 0;
                });
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
        this.isMobile = window.innerWidth < 735;
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

    gotoSection(sectionId: string) {
        this.navigateByClick = true;
        if (sectionId === 'general-details-div') {
            this.generalDetails.nativeElement.scrollIntoView();
        } else if (sectionId === 'permissible-values-div') {
            this.permissibleValue.nativeElement.scrollIntoView();
        } else if (sectionId === 'naming-div') {
            this.naming.nativeElement.scrollIntoView();
        } else if (sectionId === 'classification-div') {
            this.classification.nativeElement.scrollIntoView();
        } else if (sectionId === 'concepts-div') {
            this.concepts.nativeElement.scrollIntoView();
        } else if (sectionId === 'reference-documents-div') {
            this.referenceDocuments.nativeElement.scrollIntoView();
        } else if (sectionId === 'properties-div') {
            this.properties.nativeElement.scrollIntoView();
        } else if (sectionId === 'identifiers-div') {
            this.identifiers.nativeElement.scrollIntoView();
        } else if (sectionId === 'attachments-div') {
            this.attachments.nativeElement.scrollIntoView();
        } else if (sectionId === 'history-div') {
            this.history.nativeElement.scrollIntoView();
        } else if (sectionId === 'rules-div') {
            this.rules.nativeElement.scrollIntoView();
        }
        this.activeSection = sectionId;
    }


    @HostListener('window:scroll', [])
    onWindowScroll() {
        if (this.elt && !this.navigateByClick) {
            const scrollTop = this.window.pageYOffset || 0;
            if (scrollTop >= this.generalDetailsOffsetTop && scrollTop < this.permissibleValueOffsetTop) {
                this.activeSection = 'general-details-div';
            } else if (this.permissibleValueOffsetTop && scrollTop >= this.permissibleValueOffsetTop && scrollTop < this.namingOffsetTop) {
                this.activeSection = 'permissible-values-div';
            } else if (this.namingOffsetTop && scrollTop >= this.namingOffsetTop && scrollTop < this.classificationOffsetTop) {
                this.activeSection = 'naming-div';
            } else if (this.classificationOffsetTop && scrollTop >= this.classificationOffsetTop && scrollTop < this.conceptsOffsetTop) {
                this.activeSection = 'classification-div';
            } else if (this.conceptsOffsetTop && scrollTop >= this.conceptsOffsetTop && scrollTop < this.referenceDocumentsOffsetTop) {
                this.activeSection = 'concepts-div';
            } else if (this.referenceDocumentsOffsetTop && scrollTop >= this.referenceDocumentsOffsetTop
                && scrollTop < this.propertiesOffsetTop) {
                this.activeSection = 'reference-documents-div';
            } else if (this.propertiesOffsetTop && scrollTop >= this.propertiesOffsetTop && scrollTop < this.identifiersOffsetTop) {
                this.activeSection = 'properties-div';
            } else if (this.identifiersOffsetTop && scrollTop >= this.identifiersOffsetTop && scrollTop < this.attachmentsOffsetTop) {
                this.activeSection = 'identifiers-div';
            } else if (this.attachmentsOffsetTop && scrollTop >= this.attachmentsOffsetTop && scrollTop < this.historyOffsetTop) {
                this.activeSection = 'attachments-div';
            } else if (this.historyOffsetTop && scrollTop >= this.historyOffsetTop && scrollTop < this.rulesOffsetTop) {
                this.activeSection = 'history-div';
            } else if (this.rulesOffsetTop && scrollTop > this.rulesOffsetTop) {
                this.activeSection = 'rules-div'
            }

            if (this.activeSection !== this.previousActiveSection) {
                this.previousActiveSection = this.activeSection;
                this.ngZone.run(() => {
                })
            }
        }
        this.navigateByClick = false;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.generalDetailsOffsetTop = this.generalDetails.nativeElement.offsetTop;
            this.permissibleValueOffsetTop = this.permissibleValue.nativeElement.offsetTop;
            this.namingOffsetTop = this.naming.nativeElement.offsetTop;
            this.classificationOffsetTop = this.classification.nativeElement.offsetTop;
            this.conceptsOffsetTop = this.concepts.nativeElement.offsetTop;
            this.referenceDocumentsOffsetTop = this.referenceDocuments.nativeElement.offsetTop;
            this.propertiesOffsetTop = this.properties.nativeElement.offsetTop;
            this.identifiersOffsetTop = this.identifiers.nativeElement.offsetTop;
            this.attachmentsOffsetTop = this.attachments.nativeElement.offsetTop;
            this.historyOffsetTop = this.history.nativeElement.offsetTop;
            this.rulesOffsetTop = this.rules.nativeElement.offsetTop;
        }, 2000);
    }
}
