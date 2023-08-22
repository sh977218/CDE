import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { DeleteDraftModalComponent } from 'adminItem/delete-draft-modal/delete-draft-modal.component';
import { LinkedFormModalComponent } from 'adminItem/linkedForms/linked-form-modal/linked-form-modal.component';
import { SaveModalComponent } from 'adminItem/save-modal/saveModal.component';
import { ScrollService } from 'angular-aio-toc/scroll.service';
import { TocService } from 'angular-aio-toc/toc.service';
import { Dictionary, forEachOf } from 'async';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { areDerivationRulesSatisfied, formCdes, formQuestions, repeatFe, repeatFeQuestion } from 'core/form/fe';
import { CopyFormModalComponent } from 'form/formView/copy-form-modal/copy-form-modal.component';
import { FormCdesModalComponent } from 'form/formView/form-cdes-modal/form-cdes-modal.component';
import { FormViewService } from 'form/formView/formView.service';
import { SkipLogicValidateService } from 'form/skipLogicValidate.service';
import { UcumService } from 'form/ucum.service';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { fileInputToFormData, isIe } from 'non-core/browser';
import { LocalStorageService } from 'non-core/localStorage.service';
import { ExportService } from 'non-core/export.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Observable } from 'rxjs';
import { assertUnreachable, Cb, Cb1, Comment, Elt, Item } from 'shared/models.model';
import {
    DataElement,
    DatatypeContainerDate,
    DatatypeContainerNumber,
    DatatypeContainerText,
    DatatypeContainerTime,
} from 'shared/de/dataElement.model';
import { deepCopyElt, filterClassificationPerUser } from 'shared/elt/elt';
import {
    CdeForm,
    CdeFormDraft,
    FormElement,
    FormElementsContainer,
    FormInForm,
    FormQuestionDraft,
    QuestionCdeValueList,
} from 'shared/form/form.model';
import { addFormIds, getLabel, iterateFe, iterateFes, iterateFeSync, noopSkipIterCb } from 'shared/form/fe';
import { canEditCuratedItem, hasPrivilegeForOrg } from 'shared/security/authorizationShared';
import { getQuestionPriorByLabel } from 'shared/form/skipLogic';
import { noop } from 'shared/util';
import { map } from 'rxjs/operators';

export class LocatableError {
    id?: string;
    message: string;

    constructor(m: string, id?: string) {
        this.id = id;
        this.message = m;
    }
}

@Component({
    selector: 'cde-form-view',
    templateUrl: 'formView.component.html',
    styleUrls: ['../../cde/dataElementView/view.style.scss'],
    providers: [TocService],
})
export class FormViewComponent implements OnInit, OnDestroy {
    _elt?: CdeFormDraft;
    commentMode?: boolean;
    currentTab = 'preview_tab';
    dialogRef?: MatDialogRef<TemplateRef<any>>;
    draftSaving?: Promise<CdeFormDraft>;
    exportToTab: boolean = false;
    formInput!: Dictionary<string>;
    hasComments = false;
    hasDrafts = false;
    hasPrivilegeForOrg = hasPrivilegeForOrg;
    highlightedTabs: string[] = [];
    isIe = isIe;
    savingText = '';
    tabsCommented: string[] = [];
    unsaved = false;
    missingCdes: string[] = [];
    validationErrors: LocatableError[] = [];
    isMobile = false;
    currentVersionFormName = '';

    constructor(
        private alert: AlertService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        public exportService: ExportService,
        private formViewService: FormViewService,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private orgHelperService: OrgHelperService,
        private route: ActivatedRoute,
        private router: Router,
        private scrollService: ScrollService,
        private title: Title,
        private tocService: TocService,
        private ucumService: UcumService,
        public userService: UserService
    ) {
        this.exportToTab = !!localStorageService.getItem('exportToTab');
        this.onResize();
        this.route.fragment.subscribe(() => {
            if (this.elt) {
                const elt = this.elt;
                setTimeout(() => {
                    this.title.setTitle('Form: ' + Elt.getLabel(elt));
                    this.scrollService.scroll();
                }, 0);
            }
        });
    }

    ngOnInit() {
        this.route.queryParams.subscribe(() => {
            this.hasDrafts = false;
            this.loadElt(elt => {
                this.orgHelperService
                    .then(() => {
                        elt.usedBy = this.orgHelperService.getUsedBy(elt);
                    })
                    .catch(noop);
            });
        });
    }

    ngOnDestroy() {
        this.tocService.reset();
    }

    canEdit() {
        return canEditCuratedItem(this.userService.user, this.elt);
    }

    createDataElement(elt: CdeFormDraft, q: FormQuestionDraft, cb: Cb) {
        if (!q.question.cde.newCde) {
            return;
        }
        const dataElement = {
            designations: q.question.cde.newCde.designations,
            definitions: q.question.cde.newCde.definitions,
            stewardOrg: {
                name: elt.stewardOrg.name,
            },
            valueDomain: {
                datatype: q.question.datatype,
                identifiers: q.question.cde.ids,
                ids: q.question.cde.ids,
                datatypeText: (q.question as DatatypeContainerText).datatypeText,
                datatypeNumber: (q.question as DatatypeContainerNumber).datatypeNumber,
                datatypeDate: (q.question as DatatypeContainerDate).datatypeDate,
                datatypeTime: (q.question as DatatypeContainerTime).datatypeTime,
                permissibleValues: (q.question.cde as QuestionCdeValueList).permissibleValues,
            },
            classification: elt.classification,
            ids: q.question.cde.ids,
            registrationState: { registrationStatus: 'Incomplete' },
        };
        this.http.post<DataElement>('/server/de', dataElement).subscribe(
            res => {
                if (res.tinyId) {
                    q.question.cde.tinyId = res.tinyId;
                    delete q.question.cde.newCde;
                }
                if (res.version) {
                    q.question.cde.version = res.version;
                }
                cb();
            },
            err => {
                this.alert.httpErrorMessageAlert(err);
            }
        );
    }

    get elt(): CdeFormDraft | undefined {
        return this._elt;
    }

    eltLoad(getForm: Observable<CdeForm> | Promise<CdeForm> | CdeForm, cb: Cb1<CdeFormDraft> = noop) {
        if (getForm instanceof Observable) {
            getForm.subscribe(
                elt => this.eltLoaded(elt, cb),
                () =>
                    this.router.navigate(['/pageNotFound'], {
                        skipLocationChange: true,
                    })
            );
        } else if (getForm instanceof Promise) {
            getForm.then(
                elt => this.eltLoaded(elt, cb),
                () =>
                    this.router.navigate(['/pageNotFound'], {
                        skipLocationChange: true,
                    })
            );
        } else {
            this.eltLoaded(getForm, cb);
        }
    }

    eltLoaded(elt: CdeForm, cb: Cb1<CdeFormDraft> = noop) {
        if (elt) {
            if (elt.isDraft) {
                this.hasDrafts = true;
            }
            CdeForm.validate(elt);
            this.missingCdes = areDerivationRulesSatisfied(elt);
            addFormIds(elt);
            this._elt = elt;
            this.title.setTitle('Form: ' + Elt.getLabel(elt));
            this.loadComments(elt, () => {
                setTimeout(() => {
                    this.viewReady();
                }, 0);
            });
            if (this._elt.registrationState.registrationStatus === 'Retired') {
                this.loadCurrentVersionFormName();
            }
            this.validate(elt);
            cb(elt);
        }
    }

    eltLoadedFromOwnUpdate(elt: CdeFormDraft) {
        this._elt = elt;
        this.cdr.detectChanges();
    }

    gotoTop() {
        window.scrollTo(0, 0);
        this.router.navigate([], {
            queryParams: this.route.snapshot.queryParams,
            replaceUrl: true,
        });
    }

    hasDraftsAndLoggedIn(elt: CdeFormDraft) {
        if (!this.userService.loggedIn()) {
            if (this.hasDrafts) {
                this.hasDrafts = false;
            }
            if (elt.isDraft) {
                this.loadPublished();
            }
        }
        return this.hasDrafts;
    }

    loadComments(form: CdeForm, cb = noop) {
        if (this.userService.canSeeComment()) {
            this.http.get<Comment[]>('/server/discuss/comments/eltId/' + form.tinyId).subscribe(
                res => {
                    this.hasComments = res && res.length > 0;
                    this.tabsCommented = res.map(c => c.linkedTab + '_tab');
                    cb();
                },
                err => this.alert.httpErrorMessageAlert(err, 'Error loading comments.')
            );
        } else {
            cb();
        }
    }

    loadElt(cb: Cb1<CdeFormDraft> = noop) {
        this.eltLoad(this.formViewService.fetchEltForEditing(this.route.snapshot.queryParams), cb);
    }

    loadHighlightedTabs($event: string[]) {
        this.highlightedTabs = $event;
    }

    loadPublished(cb = noop) {
        this.eltLoad(this.formViewService.fetchPublished(this.route.snapshot.queryParams), cb);
    }

    @HostListener('window:resize', [])
    onResize() {
        this.isMobile = window.innerWidth < 768; // size md
    }

    openCopyElementModal(elt: CdeFormDraft) {
        const eltCopy = deepCopyElt(elt);
        filterClassificationPerUser(eltCopy, this.userService.userOrgs);
        this.dialog.open(CopyFormModalComponent, { width: '1200px', data: eltCopy });
    }

    openFormCdesModal(elt: CdeFormDraft) {
        this.dialog.open(FormCdesModalComponent, { width: '800px', data: formQuestions(elt) });
    }

    getFormCdes(elt: CdeFormDraft) {
        return formCdes(elt);
    }

    openSaveModal(elt: CdeFormDraft) {
        this.validate(elt, () => {
            if (this.validationErrors.length) {
                this.alert.addAlert('danger', 'Please fix all errors before publishing');
            } else {
                this.dialog
                    .open<SaveModalComponent, Item, boolean | undefined>(SaveModalComponent, {
                        width: '500',
                        data: elt,
                    })
                    .afterClosed()
                    .subscribe(result => {
                        if (result) {
                            this.saveDraft(elt).then(() => this.saveForm(elt));
                        }
                    });
            }
        });
    }

    removeAttachment(elt: CdeFormDraft, event: number) {
        this.http
            .post<CdeForm>('/server/attachment/form/remove', {
                index: event,
                id: elt._id,
            })
            .subscribe(res => {
                if (res) {
                    this.eltLoadedFromOwnUpdate(res);
                    this.alert.addAlert('success', 'Attachment Removed.');
                }
            });
    }

    openLinkedFormsModal() {
        this.dialog.open(LinkedFormModalComponent, {
            width: '800px',
            data: this.elt,
        });
    }

    openDeleteDraftModal(elt: CdeFormDraft) {
        this.dialog
            .open<DeleteDraftModalComponent, void, boolean | undefined>(DeleteDraftModalComponent, { width: '500' })
            .afterClosed()
            .subscribe(result => {
                if (result) {
                    this.formViewService.removeDraft(elt).subscribe(
                        () => this.loadElt(() => (this.hasDrafts = false)),
                        err => this.alert.httpErrorMessageAlert(err)
                    );
                }
            });
    }

    saveDraft(elt: CdeFormDraft): Promise<CdeFormDraft> {
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
            .put<CdeForm>('/server/form/draft/' + elt.tinyId, elt)
            .toPromise()
            .then(
                newElt => {
                    this.draftSaving = undefined;
                    elt.__v = newElt.__v;
                    this.validate(elt);
                    if (this.unsaved) {
                        this.unsaved = false;
                        return this.saveDraft(elt);
                    }
                    this.savingText = 'Saved';
                    setTimeout(() => {
                        this.savingText = '';
                    }, 3000);
                    return elt;
                },
                err => {
                    this.draftSaving = undefined;
                    this.savingText = 'Cannot save this old version. Reload and redo.';
                    this.alert.httpErrorMessageAlert(err);
                    throw err;
                }
            ));
    }

    saveDraftVoid(elt: CdeFormDraft): void {
        this.saveDraft(elt).catch(noop);
    }

    saveForm(elt: CdeFormDraft) {
        const saveFormImpl = () => {
            const newCdeQuestions: FormQuestionDraft[] = [];
            iterateFes(
                elt.formElements,
                undefined,
                undefined,
                (fe, cb) => {
                    if (!fe.question.cde.tinyId && (fe as FormQuestionDraft).question.cde.newCde) {
                        newCdeQuestions.push(fe as FormQuestionDraft);
                    }
                    cb();
                },
                () => {
                    forEachOf(
                        newCdeQuestions,
                        (q: FormQuestionDraft, index: any, doneOneCde: Cb) => {
                            this.createDataElement(elt, q, doneOneCde);
                        },
                        () => {
                            const publish = () => {
                                const publishData = {
                                    _id: elt._id,
                                    tinyId: elt.tinyId,
                                    __v: elt.__v,
                                };
                                this.http.post('/server/form/publish', publishData).subscribe(
                                    res => {
                                        if (res) {
                                            this.hasDrafts = false;
                                            this.loadElt(() => this.alert.addAlert('success', 'Form saved.'));
                                        }
                                    },
                                    err => this.alert.httpErrorMessageAlert(err, 'Error publishing')
                                );
                            };
                            if (newCdeQuestions.length) {
                                this.saveDraft(elt).then(
                                    () => {
                                        publish();
                                    },
                                    err => this.alert.httpErrorMessageAlert(err, 'Error saving form')
                                );
                            } else {
                                publish();
                            }
                        }
                    );
                }
            );
        };

        if (this.draftSaving) {
            this.draftSaving.then(saveFormImpl, noop);
        } else {
            saveFormImpl();
        }
    }

    scrollToDescriptionId(elt: CdeFormDraft, id: string) {
        this.currentTab = 'description_tab';
        this.router.navigate(['/formEdit'], {
            queryParams: { tinyId: elt.tinyId },
            fragment: id,
        });
    }

    setDefault(elt: CdeFormDraft, index: number) {
        this.http
            .post<CdeForm>('/server/attachment/form/setDefault', {
                index,
                state: elt.attachments[index].isDefault,
                id: elt._id,
            })
            .subscribe(res => {
                this.eltLoadedFromOwnUpdate(res);
                this.alert.addAlert('success', 'Saved');
            });
    }

    upload(elt: CdeFormDraft, event: Event) {
        const formData = fileInputToFormData(event.srcElement as HTMLInputElement);
        if (formData) {
            formData.append('id', elt._id);
            this.http.post<any>('/server/attachment/form/add', formData).subscribe(r => {
                if (r.message) {
                    this.alert.addAlert('info', r);
                } else {
                    this.eltLoadedFromOwnUpdate(r);
                    this.alert.addAlert('success', 'Attachment added.');
                }
            });
        }
    }

    filterReferenceDocument(elt: CdeFormDraft) {
        return elt.referenceDocuments.filter(rd => !!rd.document);
    }

    loadCurrentVersionFormName() {
        const tinyId = this._elt?.registrationState.mergedTo?.tinyId
            ? this._elt?.registrationState.mergedTo.tinyId
            : this._elt?.tinyId;
        if (tinyId) {
            this.http
                .get(`/server/form/forEdit/${tinyId}`)
                .pipe(map((f: any) => f?.designations[0].designation))
                .subscribe(fName => (this.currentVersionFormName = fName));
        }
    }

    validate(elt: CdeFormDraft, cb: Cb = noop): void {
        this.validationErrors.length = 0;
        this.validateNoFeCycle(elt);
        this.validateRepeat(elt);
        this.validateSkipLogic(elt);
        this.validateDefinitions(elt);
        this.validateUoms(elt, cb);
    }

    validateDefinitions(elt: CdeFormDraft) {
        elt.definitions.forEach(def => {
            if (!def.definition || !def.definition.length) {
                this.validationErrors.push(new LocatableError('Definition may not be empty.', undefined));
            }
        });
    }

    validateNoFeCycle(elt: CdeFormDraft) {
        iterateFeSync(
            elt,
            (f: FormInForm, tinyId: string) => {
                if (f.inForm.form.tinyId === tinyId) {
                    this.validationErrors.push(
                        new LocatableError(
                            'Form or Subform refers to itself meaning the form never ends.',
                            f.elementType + '_' + f.feId
                        )
                    );
                }
                return tinyId;
            },
            undefined,
            undefined,
            elt.tinyId
        );
    }

    validateRepeat(elt: CdeFormDraft) {
        const validationErrors = this.validationErrors;

        const findExistingErrors = (parent: FormElementsContainer, fe: FormElement) => {
            if (fe.repeat) {
                const repeat = repeatFe(fe);
                switch (repeat) {
                    case '=':
                        if (!getQuestionPriorByLabel(fe, fe, repeatFeQuestion(fe), this.elt)) {
                            validationErrors.push(
                                new LocatableError(
                                    'Repeat Prior Question does not exist: "' + getLabel(fe) + '".',
                                    fe.elementType + '_' + fe.feId
                                )
                            );
                        }
                        break;
                    case 'F':
                        const refQuestion = NativeRenderService.getFirstQuestion(fe);
                        if (!refQuestion) {
                            validationErrors.push(
                                new LocatableError(
                                    'Repeat First Question does not exist: "' + getLabel(fe) + '".',
                                    fe.elementType + '_' + fe.feId
                                )
                            );
                            break;
                        }
                        if (refQuestion.question.datatype !== 'Value List') {
                            validationErrors.push(
                                new LocatableError(
                                    'Repeat First Question does not a Value List: "' + getLabel(fe) + '".',
                                    fe.elementType + '_' + fe.feId
                                )
                            );
                        }
                        break;
                    case 'N':
                        if (parseInt(fe.repeat, 10) < 1) {
                            validationErrors.push(
                                new LocatableError(
                                    'Repeat Number is below 1: "' + getLabel(fe) + '".',
                                    fe.elementType + '_' + fe.feId
                                )
                            );
                        }
                        break;
                    case '':
                        validationErrors.push(
                            new LocatableError(
                                'Bad Repeat Type "' + getLabel(fe) + '".',
                                fe.elementType + '_' + fe.feId
                            )
                        );
                        break;
                    default:
                        throw assertUnreachable(repeat);
                }
            }
            if (Array.isArray(fe.formElements)) {
                fe.formElements.forEach(f => findExistingErrors(fe, f));
            }
        };

        elt.formElements.forEach(fe => findExistingErrors(elt, fe));
    }

    validateSkipLogic(elt: CdeFormDraft) {
        const validationErrors = this.validationErrors;

        function findExistingErrors(parent: FormElementsContainer, fe: FormElement) {
            if (fe.skipLogic && !SkipLogicValidateService.validateSkipLogic(parent, fe, fe.skipLogic)) {
                validationErrors.push(
                    new LocatableError(
                        'SkipLogic error on form element "' + getLabel(fe) + '".',
                        fe.elementType + '_' + fe.feId
                    )
                );
            }
            if (Array.isArray(fe.formElements)) {
                fe.formElements.forEach(f => findExistingErrors(fe, f));
            }
        }

        elt.formElements.forEach(fe => findExistingErrors(elt, fe));
    }

    validateUoms(elt: CdeFormDraft, callback: Cb) {
        iterateFe(
            elt,
            noopSkipIterCb,
            undefined,
            (q, cb) => {
                this.ucumService.validateUoms(q.question, () => {
                    if (q.question.uomsValid.some(e => !!e)) {
                        this.validationErrors.push(
                            new LocatableError(
                                'Unit of Measure error on question "' + getLabel(q) + '".',
                                q.elementType + '_' + q.feId
                            )
                        );
                    }
                    cb();
                });
            },
            () => callback()
        );
    }

    viewChanges() {
        const draft = this.elt;
        this.formViewService.fetchPublished(this.route.snapshot.queryParams).then(
            published => {
                this.dialog.open(CompareHistoryContentComponent, {
                    width: '800px',
                    data: { newer: draft, older: published },
                });
            },
            err => this.alert.httpErrorMessageAlert(err, 'Error loading view changes.')
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
