import { HttpClient } from '@angular/common/http';
import {
    ChangeDetectorRef,
    Component,
    HostListener,
    Inject,
    NgZone,
    OnDestroy,
    OnInit,
    TemplateRef,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { DeleteDraftModalComponent } from 'adminItem/delete-draft-modal/delete-draft-modal.component';
import { SaveModalComponent } from 'adminItem/save-modal/saveModal.component';
import { ScrollService } from 'angular-aio-toc/scroll.service';
import { TocService } from 'angular-aio-toc/toc.service';
import { CopyDataElementModalComponent } from 'cde/dataElementView/copy-data-element-modal/copy-data-element-modal.component';
import { DataElementViewService } from 'cde/dataElementView/dataElementView.service';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { fileInputToFormData } from 'non-core/browser';
import { ExportService } from 'non-core/export.service';
import { LocalStorageService } from 'non-core/localStorage.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Observable } from 'rxjs';
import { DataElement } from 'shared/de/dataElement.model';
import { checkPvUnicity, checkDefinitions } from 'shared/de/dataElement.model';
import { deepCopyElt, filterClassificationPerUser } from 'shared/elt/elt';
import { Cb1, Comment, Elt, Item } from 'shared/models.model';
import { canEditCuratedItem, hasPrivilegeForOrg, isOrgAuthority } from 'shared/security/authorizationShared';
import { noop } from 'shared/util';
import { WINDOW, WINDOW_PROVIDERS } from 'window.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TocModule } from 'angular-aio-toc/toc.module';
import { DiscussModule } from 'discuss/discuss.module';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PinToBoardModule } from 'board/pin-to-board.module';
import { TourAnchorMatMenuDirective } from 'ngx-ui-tour-md-menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { DeGeneralDetailsComponent } from 'cde/deGeneralDetails/deGeneralDetails.component';
import { PermissibleValueComponent } from 'cde/permissibleValue/permissibleValue.component';
import { ConceptsComponent } from 'cde/concepts/concepts.component';
import { DerivationRulesComponent } from 'cde/derivationRules/derivationRules.component';
import { CdeClassificationComponent } from 'cde/cdeClassification/cdeClassification.component';
import { RegistrationValidatorService } from 'non-core/registrationValidator.service';
import { MyBoardsService } from 'board/myBoards.service';
import { ClassificationService } from 'non-core/classification.service';
import { IsAllowedService } from 'non-core/isAllowed.service';

@Component({
    selector: 'cde-data-element-view',
    templateUrl: 'dataElementView.component.html',
    styleUrls: ['./view.style.scss'],
    providers: [
        TocService,
        DataElementViewService,
        MyBoardsService,
        ClassificationService,
        IsAllowedService,
        ExportService,
        RegistrationValidatorService,
        OrgHelperService,
        WINDOW_PROVIDERS,
    ],
    imports: [
        MatProgressSpinnerModule,
        NgIf,
        MatSidenavModule,
        TocModule,
        DiscussModule,
        MatIconModule,
        RouterLink,
        NgForOf,
        MatMenuModule,
        PinToBoardModule,
        NgTemplateOutlet,
        TourAnchorMatMenuDirective,
        NgClass,
        MatTooltipModule,
        DatePipe,
        AdminItemModule,
        DeGeneralDetailsComponent,
        PermissibleValueComponent,
        ConceptsComponent,
        DerivationRulesComponent,
        CdeClassificationComponent,
    ],
    standalone: true,
})
export class DataElementViewComponent implements OnDestroy, OnInit {
    _elt?: DataElement;
    commentMode?: boolean;
    currentTab = 'general_tab';
    dialogRef?: MatDialogRef<TemplateRef<any>>;
    displayStatusWarning?: boolean;
    draftSaving?: Promise<DataElement>;
    exportToTab: boolean = false;
    hasDrafts = false;
    hasPrivilegeForOrg = hasPrivilegeForOrg;
    highlightedTabs: string[] = [];
    isMobile = false;
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
                this.loadElt(elt => {
                    elt.usedBy = this.orgHelperService.getUsedBy(elt);
                });
            });
        }, noop);
    }

    constructor(
        private route: ActivatedRoute,
        private alert: AlertService,
        private ref: ChangeDetectorRef,
        private deViewService: DataElementViewService,
        public exportService: ExportService,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private dialog: MatDialog,
        private orgHelperService: OrgHelperService,
        private router: Router,
        private scrollService: ScrollService,
        private title: Title,
        private tocService: TocService,
        public userService: UserService,
        private ngZone: NgZone,
        @Inject(WINDOW) private window: Window
    ) {
        this.exportToTab = !!localStorageService.getItem('exportToTab');
        this.onResize();
        this.route.fragment.subscribe(() => {
            if (this.elt) {
                const elt = this.elt;
                setTimeout(() => {
                    this.title.setTitle('Data Element: ' + Elt.getLabel(elt));
                    this.scrollService.scroll();
                }, 0);
            }
        });
    }

    canEdit() {
        return canEditCuratedItem(this.userService.user, this.elt);
    }

    get elt(): DataElement | undefined {
        return this._elt;
    }

    eltLoad(getElt: Observable<DataElement> | Promise<DataElement> | DataElement, cb: Cb1<DataElement> = noop) {
        if (getElt instanceof Observable) {
            getElt.subscribe(
                elt => this.eltLoaded(elt, cb),
                () =>
                    this.router.navigate(['/pageNotFound'], {
                        skipLocationChange: true,
                    })
            );
        } else if (getElt instanceof Promise) {
            getElt.then(
                elt => this.eltLoaded(elt, cb),
                () =>
                    this.router.navigate(['/pageNotFound'], {
                        skipLocationChange: true,
                    })
            );
        } else {
            this.eltLoaded(getElt, cb);
        }
    }

    eltLoaded(elt: DataElement, cb: Cb1<DataElement> = noop) {
        if (elt) {
            if (elt.isDraft) {
                this.hasDrafts = true;
            }
            DataElement.validate(elt);
            this._elt = elt;
            this.title.setTitle('Data Element: ' + Elt.getLabel(elt));
            this.validate(elt);
            this.loadComments(elt, () => {
                setTimeout(() => {
                    this.viewReady();
                }, 0);
            });
            if (this.userService.user) {
                checkPvUnicity(elt.valueDomain);
            }
            this.displayStatusWarning = (() => {
                if (
                    !this.elt ||
                    this.elt.archived ||
                    (this.userService.user && isOrgAuthority(this.userService.user))
                ) {
                    return false;
                }
                return (
                    hasPrivilegeForOrg(this.userService.user, 'edit', this.elt.stewardOrg.name) &&
                    (this.elt.registrationState.registrationStatus === 'Standard' ||
                        this.elt.registrationState.registrationStatus === 'Preferred Standard')
                );
            })();
            cb(elt);
        }
    }

    eltLoadedFromOwnUpdate(elt: DataElement) {
        this._elt = elt;
        this.validate(elt);
        this.ref.detectChanges();
    }

    gotoTop() {
        window.scrollTo(0, 0);
        this.router.navigate([], {
            queryParams: this.route.snapshot.queryParams,
            replaceUrl: true,
        });
    }

    loadComments(de: DataElement, cb = noop) {
        if (this.userService.canSeeComment()) {
            this.http.get<Comment[]>('/server/discuss/comments/eltId/' + de.tinyId).subscribe(
                res => {
                    this.comments = res;
                    cb();
                },
                err => this.alert.httpErrorAlert(err, 'Error loading comments.')
            );
        } else {
            cb();
        }
    }

    loadElt(cb: Cb1<DataElement> = noop) {
        this.eltLoad(this.deViewService.fetchEltForEditing(this.route.snapshot.queryParams), cb);
    }

    loadHighlightedTabs($event: string[]) {
        this.highlightedTabs = $event;
    }

    loadPublished(cb = noop) {
        this.eltLoad(this.deViewService.fetchPublished(this.route.snapshot.queryParams), cb);
    }

    @HostListener('window:resize', [])
    onResize() {
        this.isMobile = window.innerWidth < 768; // size md
    }

    openSaveModal(elt: DataElement) {
        if (this.validationErrors.length) {
            this.alert.addAlert('danger', 'Please fix all errors before publishing');
        } else {
            this.dialog
                .open<SaveModalComponent, Item, boolean | undefined>(SaveModalComponent, { width: '500', data: elt })
                .afterClosed()
                .subscribe(result => {
                    if (result) {
                        this.saveDraft(elt).then(newDraft => this.saveDataElement(newDraft));
                    }
                });
        }
    }

    openCopyElementModal(elt: DataElement) {
        const eltCopy = deepCopyElt(elt);
        filterClassificationPerUser(eltCopy, this.userService.userOrgs);
        this.dialog.open(CopyDataElementModalComponent, {
            width: '1200px',
            data: eltCopy,
        });
    }

    removeAttachment(elt: DataElement, index: number) {
        this.http
            .post<DataElement>('/server/attachment/cde/remove', {
                index,
                id: elt._id,
            })
            .subscribe(res => {
                if (res) {
                    this.eltLoadedFromOwnUpdate(res);
                    this.alert.addAlert('success', 'Attachment Removed.');
                }
            });
    }

    setDefault(elt: DataElement, index: number) {
        this.http
            .post<DataElement>('/server/attachment/cde/setDefault', {
                index,
                state: elt.attachments[index].isDefault,
                id: elt._id,
            })
            .subscribe(res => {
                if (res) {
                    this.eltLoadedFromOwnUpdate(res);
                    this.alert.addAlert('success', 'Saved');
                }
            });
    }

    upload(elt: DataElement, event: Event) {
        const formData = fileInputToFormData(event.srcElement as HTMLInputElement);
        if (formData) {
            formData.append('id', elt._id);
            this.http.post<any>('/server/attachment/cde/add', formData).subscribe(r => {
                if (r.message) {
                    this.alert.addAlert('info', r);
                } else {
                    if (r) {
                        this.eltLoadedFromOwnUpdate(r);
                        this.alert.addAlert('success', 'Attachment added.');
                    }
                }
            });
        }
    }

    openDeleteDraftModal(elt: DataElement) {
        this.dialog
            .open<DeleteDraftModalComponent, void, boolean | undefined>(DeleteDraftModalComponent, { width: '500' })
            .afterClosed()
            .subscribe(result => {
                if (result) {
                    this.deViewService.removeDraft(elt).subscribe(
                        () => this.loadElt(() => (this.hasDrafts = false)),
                        err => this.alert.httpErrorAlert(err)
                    );
                }
            });
    }

    saveDraft(elt: DataElement): Promise<DataElement> {
        if (!elt.isDraft) {
            elt.changeNote = '';
        }
        elt.isDraft = true;
        this.hasDrafts = true;
        this.savingText = 'Saving ...';
        if (this.draftSaving) {
            this.unsaved = true;
            return this.draftSaving;
        }
        return (this.draftSaving = this.http
            .put<DataElement>('/server/de/draft/' + elt.tinyId, elt)
            .toPromise()
            .then(
                newElt => {
                    this.draftSaving = undefined;
                    if (newElt) {
                        this.eltLoadedFromOwnUpdate(newElt);
                    }
                    if (this.unsaved) {
                        this.unsaved = false;
                        return this.saveDraft(elt);
                    }
                    this.savingText = 'Saved';
                    setTimeout(() => {
                        this.savingText = '';
                    }, 3000);
                    return newElt;
                },
                err => {
                    this.draftSaving = undefined;
                    this.savingText = 'Save Error. Please reload and redo.';
                    this.alert.httpErrorAlert(err);
                    throw err;
                }
            ));
    }

    filterReferenceDocument(elt: DataElement) {
        return elt.referenceDocuments.filter(rd => !!rd.document);
    }

    saveDraftVoid(elt: DataElement): void {
        this.saveDraft(elt).catch(noop);
    }

    saveDataElement(elt: DataElement) {
        const saveImpl = () => {
            const publishData = {
                _id: elt._id,
                tinyId: elt.tinyId,
                __v: elt.__v,
            };
            this.http.post('/server/de/publish', publishData).subscribe(
                res => {
                    if (res) {
                        this.hasDrafts = false;
                        this.loadElt(() => this.alert.addAlert('success', 'Data Element saved.'));
                    }
                },
                err => this.alert.httpErrorAlert(err, 'Error publishing')
            );
        };

        if (this.draftSaving) {
            this.draftSaving.then(saveImpl, noop);
        } else {
            saveImpl();
        }
    }

    validate(elt: DataElement): void {
        this.validationErrors.length = 0;
        const defError = checkDefinitions(elt);
        if (defError.allValid !== true) {
            this.validationErrors.push({ message: defError.message });
        }
        const pvErrors = checkPvUnicity(elt.valueDomain);
        if (pvErrors.allValid !== true) {
            this.validationErrors.push({ message: pvErrors.message });
        }
    }

    viewChanges() {
        const draft = this.elt;
        this.deViewService.fetchPublished(this.route.snapshot.queryParams).then(
            published => {
                this.dialog.open(CompareHistoryContentComponent, {
                    width: '1000px',
                    data: { newer: draft, older: published },
                });
            },
            err => this.alert.httpErrorAlert(err, 'Error loading view changes.')
        );
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
