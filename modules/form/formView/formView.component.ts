import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { SaveModalComponent } from 'adminItem/save-modal/saveModal.component';
import { ScrollService } from 'angular-aio-toc/scroll.service';
import { TocService } from 'angular-aio-toc/toc.service';
import { Dictionary, forEachOf } from 'async';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { areDerivationRulesSatisfied, formQuestions, repeatFe, repeatFeQuestion } from 'core/form/fe';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { FormViewService } from 'form/formView/formView.service';
import { SkipLogicValidateService } from 'form/skipLogicValidate.service';
import { UcumService } from 'form/ucum.service';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { isIe } from 'non-core/browser';
import { LocalStorageService } from 'non-core/localStorage.service';
import { ExportService } from 'non-core/export.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Observable } from 'rxjs';
import { assertUnreachable, Cb, Cb1, Comment, Elt } from 'shared/models.model';
import {
    DataElement, DatatypeContainerDate, DatatypeContainerNumber, DatatypeContainerText, DatatypeContainerTime
} from 'shared/de/dataElement.model';
import {
    CdeForm, CdeFormDraft, FormElement, FormElementsContainer, FormInForm, FormQuestionDraft, QuestionCde,
    QuestionCdeValueList
} from 'shared/form/form.model';
import { addFormIds, getLabel, iterateFe, iterateFes, iterateFeSync, noopSkipIterCb } from 'shared/form/fe';
import { canEditCuratedItem, hasPrivilegeForOrg } from 'shared/security/authorizationShared';
import { getQuestionPriorByLabel } from 'shared/form/skipLogic';
import { copyDeep, noop } from 'shared/util';
import { PinToBoardModalComponent } from 'board/pin-to-board/pin-to-board-modal/pin-to-board-modal.component';
import { DeleteDraftModalComponent } from 'adminItem/delete-draft-modal/delete-draft-modal.component';

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
    styleUrls: [
        '../../cde/dataElementView/view.style.scss'
    ],
    providers: [TocService]
})
export class FormViewComponent implements OnInit, OnDestroy {
    @ViewChild('commentAreaComponent', {static: true}) commentAreaComponent!: DiscussAreaComponent;
    @ViewChild('copyFormContent', {static: true}) copyFormContent!: TemplateRef<any>;
    @ViewChild('formCdesContent', {static: true}) formCdesContent!: TemplateRef<any>;
    @ViewChild('mltPinModalCde', {static: true}) mltPinModalCde!: PinToBoardModalComponent;
    @ViewChild('saveModal') saveModal!: SaveModalComponent;
    _elt?: CdeFormDraft;
    commentMode?: boolean;
    currentTab = 'preview_tab';
    dialogRef!: MatDialogRef<any>;
    draftSaving?: Promise<void>;
    eltCopy?: CdeForm;
    questions: any[] = [];
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

    constructor(private alert: AlertService,
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
            this.loadElt((elt) => {
                this.orgHelperService.then(() => {
                    elt.usedBy = this.orgHelperService.getUsedBy(elt);
                }).catch(noop);
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
                name: elt.stewardOrg.name
            },
            valueDomain: {
                datatype: q.question.datatype,
                identifiers: q.question.cde.ids,
                ids: q.question.cde.ids,
                datatypeText: (q.question as DatatypeContainerText).datatypeText,
                datatypeNumber: (q.question as DatatypeContainerNumber).datatypeNumber,
                datatypeDate: (q.question as DatatypeContainerDate).datatypeDate,
                datatypeTime: (q.question as DatatypeContainerTime).datatypeTime,
                permissibleValues: (q.question.cde as QuestionCdeValueList).permissibleValues
            },
            classification: elt.classification,
            ids: q.question.cde.ids,
            registrationState: {registrationStatus: 'Incomplete'}
        };
        this.http.post<DataElement>('/server/de', dataElement)
            .subscribe(res => {
                if (res.tinyId) {
                    q.question.cde.tinyId = res.tinyId;
                    delete q.question.cde.newCde;
                }
                if (res.version) {
                    q.question.cde.version = res.version;
                }
                cb();
            }, err => {
                this.alert.httpErrorMessageAlert(err);
            });
    }

    get elt(): CdeFormDraft | undefined {
        return this._elt;
    }

    eltLoad(getForm: Observable<CdeForm> | Promise<CdeForm> | CdeForm, cb: Cb1<CdeFormDraft> = noop) {
        if (getForm instanceof Observable) {
            getForm.subscribe(
                elt => this.eltLoaded(elt, cb),
                () => this.router.navigate(['/pageNotFound'], {skipLocationChange: true})
            );
        } else if (getForm instanceof Promise) {
            getForm.then(
                elt => this.eltLoaded(elt, cb),
                () => this.router.navigate(['/pageNotFound'], {skipLocationChange: true})
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
            this.validate(elt);
            cb(elt);
        }
    }

    eltLoadedFromOwnUpdate(elt: CdeFormDraft) {
        this._elt = elt;
        this.cdr.detectChanges();
    }

    exportPublishForm(elt: CdeFormDraft) {
        this.http.post('/server/form/publish/' + elt._id, {
            publishedFormName: this.formInput.publishedFormName,
            endpointUrl: this.formInput.endpointUrl
        }).subscribe(
            () => {
                this.userService.reload();
                this.alert.addAlert('info', 'Done. Go to your profile to see all your published forms');
                this.dialogRef.close();
            }, err => {
                this.alert.httpErrorMessageAlert(err, 'Error when publishing form.');
                this.dialogRef.close();
            }
        );
    }

    gotoTop() {
        window.scrollTo(0, 0);
        this.router.navigate([], {queryParams: this.route.snapshot.queryParams, replaceUrl: true})
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
            this.http.get<Comment[]>('/server/discuss/comments/eltId/' + form.tinyId).subscribe(res => {
                this.hasComments = res && (res.length > 0);
                this.tabsCommented = res.map(c => c.linkedTab + '_tab');
                cb();
            }, err => this.alert.httpErrorMessageAlert(err, 'Error loading comments.'));
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
        this.isMobile = window.innerWidth < 768;
    }

    openCopyElementModal(elt: CdeFormDraft) {
        const eltCopy = this.eltCopy = copyDeep(elt);
        eltCopy.classification = elt.classification
            && elt.classification.filter(c => this.userService.userOrgs.indexOf(c.stewardOrg.name) !== -1);
        eltCopy.registrationState.administrativeNote = 'Copy of: ' + elt.tinyId;
        delete (eltCopy as any).tinyId;
        delete eltCopy._id;
        delete eltCopy.origin;
        delete eltCopy.created;
        delete eltCopy.updated;
        delete eltCopy.imported;
        delete eltCopy.updatedBy;
        delete eltCopy.createdBy;
        delete eltCopy.version;
        delete (eltCopy as any).history;
        delete eltCopy.changeNote;
        delete (eltCopy as any).comments;
        eltCopy.ids = [];
        eltCopy.sources = [];
        eltCopy.designations[0].designation = 'Copy of: ' + eltCopy.designations[0].designation;
        eltCopy.registrationState = {
            administrativeNote: 'Copy of: ' + elt.tinyId,
            registrationStatus: 'Incomplete',
        };
        this.dialogRef = this.dialog.open(this.copyFormContent, {width: '1200px'});
    }

    openFormCdesModal(elt: CdeFormDraft) {
        this.questions = formQuestions(elt);
        this.dialogRef = this.dialog.open(this.formCdesContent, {width: '800px'});
    }

    pinAllCdesIntoBoard(elt: CdeFormDraft) {
        const cdes: QuestionCde[] = [];

        function doFormElement(formElt: FormElement) {
            if (formElt.elementType === 'question') {
                cdes.push(formElt.question.cde);
            } else {
                if (formElt.elementType === 'section' || formElt.elementType === 'form') {
                    formElt.formElements.forEach(doFormElement);
                }
            }
        }

        elt.formElements.forEach(doFormElement);
        this.mltPinModalCde.pinMultiple(cdes);
    }

    openSaveModal() {
        this.validate(this.elt, () => {
            if (this.validationErrors.length) {
                this.alert.addAlert('danger', 'Please fix all errors before publishing');
            } else {
                const data = this.elt;
                this.dialog.open(SaveModalComponent, {width: '500', data}).afterClosed().subscribe(result => {
                    if (result) {
                        this.saveDraft(this.elt).then(() => this.saveForm(this.elt));
                    }
                })

            }
        });
    }

    removeAttachment(elt: CdeFormDraft, event: number) {
        this.http.post<CdeForm>('/server/attachment/form/remove', {
            index: event,
            id: elt._id
        }).subscribe(res => {
            elt = res;
            this.alert.addAlert('success', 'Attachment Removed.');
            this.cdr.detectChanges();
        });
    }

    openDeleteDraftModal() {
        this.dialog.open(DeleteDraftModalComponent, {width: '500'}).afterClosed().subscribe(result => {
            if (result) {
                this.formViewService.removeDraft(this.elt).subscribe(
                    () => this.loadElt(() => this.hasDrafts = false),
                    err => this.alert.httpErrorMessageAlert(err)
                )
            }
        })
    }

    saveDraft(elt: CdeFormDraft): Promise<void> {
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
        return this.draftSaving = this.http.put<CdeForm>('/server/form/draft/' + elt.tinyId, elt)
            .toPromise().then(newElt => {
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
            }, err => {
                this.draftSaving = undefined;
                this.savingText = 'Cannot save this old version. Reload and redo.';
                this.alert.httpErrorMessageAlert(err);
                throw err;
            });
    }

    saveDraftVoid(elt: CdeFormDraft): void {
        this.saveDraft(elt).catch(noop);
    }

    saveForm(elt: CdeFormDraft) {
        const saveFormImpl = () => {
            const newCdeQuestions: FormQuestionDraft[] = [];
            iterateFes(elt.formElements, undefined, undefined, (fe, cb) => {
                if (!fe.question.cde.tinyId && (fe as FormQuestionDraft).question.cde.newCde) {
                    newCdeQuestions.push(fe as FormQuestionDraft);
                }
                cb();
            }, () => {
                forEachOf(newCdeQuestions, (q: FormQuestionDraft, index: any, doneOneCde: Cb) => {
                    this.createDataElement(elt, q, doneOneCde);
                }, () => {
                    const publish = () => {
                        const publishData = {_id: elt._id, tinyId: elt.tinyId, __v: elt.__v};
                        this.http.post('/server/form/publish', publishData).subscribe(res => {
                            if (res) {
                                this.hasDrafts = false;
                                this.loadElt(() => this.alert.addAlert('success', 'Form saved.'));
                            }
                        }, err => this.alert.httpErrorMessageAlert(err, 'Error publishing'));
                    };
                    if (newCdeQuestions.length) {
                        this.saveDraft(elt).then(() => {
                            publish();
                        }, err => this.alert.httpErrorMessageAlert(err, 'Error saving form'));
                    } else {
                        publish();
                    }
                });
            });
        };

        if (this.draftSaving) {
            this.draftSaving.then(saveFormImpl, noop);
        } else {
            saveFormImpl();
        }
    }

    scrollToDescriptionId(elt: CdeFormDraft, id: string) {
        this.currentTab = 'description_tab';
        this.router.navigate(['/formEdit'], {queryParams: {tinyId: elt.tinyId}, fragment: id});
    }

    setDefault(elt: CdeFormDraft, index: number) {
        this.http.post<CdeForm>('/server/attachment/form/setDefault', {
            index,
            state: elt.attachments[index].isDefault,
            id: elt._id
        }).subscribe(res => {
            this.eltLoadedFromOwnUpdate(res);
            this.alert.addAlert('success', 'Saved');
        });
    }

    upload(elt: CdeFormDraft, event: Event) {
        if (event.srcElement && (event.srcElement as HTMLInputElement).files) {
            const files = (event.srcElement as HTMLInputElement).files;
            const formData = new FormData();
            if (files) {
                /* tslint:disable */
                for (let i = 0; i < files.length; i++) {
                    formData.append('uploadedFiles', files[i]);
                }
                /* tslint:enable */
            }
            formData.append('id', elt._id);
            this.http.post<any>('/server/attachment/form/add', formData).subscribe(
                r => {
                    if (r.message) {
                        this.alert.addAlert('info', r);
                    } else {
                        this.eltLoadedFromOwnUpdate(r)
                        this.alert.addAlert('success', 'Attachment added.');
                    }
                }
            );
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
        iterateFeSync(elt, (f: FormInForm, tinyId: string) => {
            if (f.inForm.form.tinyId === tinyId) {
                this.validationErrors.push(new LocatableError(
                    'Form or Subform refers to itself meaning the form never ends.', f.elementType + '_' + f.feId
                ));
            }
            return tinyId;
        }, undefined, undefined, elt.tinyId);
    }

    validateRepeat(elt: CdeFormDraft) {
        const validationErrors = this.validationErrors;

        const findExistingErrors = (parent: FormElementsContainer, fe: FormElement) => {
            if (fe.repeat) {
                const repeat = repeatFe(fe);
                switch (repeat) {
                    case '=':
                        if (!getQuestionPriorByLabel(fe, fe, repeatFeQuestion(fe), this.elt)) {
                            validationErrors.push(new LocatableError(
                                'Repeat Prior Question does not exist: "' + getLabel(fe) + '".', fe.elementType + '_' + fe.feId));
                        }
                        break;
                    case 'F':
                        const refQuestion = NativeRenderService.getFirstQuestion(fe);
                        if (!refQuestion) {
                            validationErrors.push(new LocatableError(
                                'Repeat First Question does not exist: "' + getLabel(fe) + '".', fe.elementType + '_' + fe.feId));
                            break;
                        }
                        if (refQuestion.question.datatype !== 'Value List') {
                            validationErrors.push(new LocatableError(
                                'Repeat First Question does not a Value List: "' + getLabel(fe) + '".', fe.elementType + '_' + fe.feId));
                        }
                        break;
                    case 'N':
                        if (parseInt(fe.repeat, 10) < 1) {
                            validationErrors.push(new LocatableError(
                                'Repeat Number is below 1: "' + getLabel(fe) + '".', fe.elementType + '_' + fe.feId));
                        }
                        break;
                    case '':
                        validationErrors.push(new LocatableError(
                            'Bad Repeat Type "' + getLabel(fe) + '".', fe.elementType + '_' + fe.feId));
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
                validationErrors.push(new LocatableError(
                    'SkipLogic error on form element "' + getLabel(fe) + '".', fe.elementType + '_' + fe.feId));
            }
            if (Array.isArray(fe.formElements)) {
                fe.formElements.forEach(f => findExistingErrors(fe, f));
            }
        }

        elt.formElements.forEach(fe => findExistingErrors(elt, fe));
    }

    validateUoms(elt: CdeFormDraft, callback: Cb) {
        iterateFe(elt, noopSkipIterCb, undefined, (q, cb) => {
            this.ucumService.validateUoms(q.question, () => {
                if (q.question.uomsValid.some(e => !!e)) {
                    this.validationErrors.push(new LocatableError(
                        'Unit of Measure error on question "' + getLabel(q) + '".', q.elementType + '_' + q.feId));
                }
                cb();
            });
        }, () => callback());
    }

    viewChanges() {
        const draft = this.elt;
        this.formViewService.fetchPublished(this.route.snapshot.queryParams).then(published => {
            this.dialogRef = this.dialog.open(CompareHistoryContentComponent,
                {width: '800px', data: {newer: draft, older: published}});
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