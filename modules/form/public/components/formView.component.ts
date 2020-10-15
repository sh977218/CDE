import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { SaveModalComponent } from 'adminItem/saveModal/saveModal.component';
import { Dictionary } from 'async';
import * as async_forEach from 'async/forEach';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { areDerivationRulesSatisfied, repeatFeQuestion, repeatFe } from 'core/form/fe';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { FormViewService } from 'form/public/components/formView.service';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import * as _cloneDeep from 'lodash/cloneDeep';
import * as _noop from 'lodash/noop';
import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { isIe } from 'non-core/browser';
import { LocalStorageService } from 'non-core/localStorage.service';
import { ExportService } from 'non-core/export.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Observable } from 'rxjs';
import { assertUnreachable, Cb, Comment, Elt } from 'shared/models.model';
import {
    DataElement, DatatypeContainerDate, DatatypeContainerNumber, DatatypeContainerText, DatatypeContainerTime
} from 'shared/de/dataElement.model';
import {
    CdeForm, CdeFormDraft, FormElement, FormElementsContainer, FormInForm, FormQuestionDraft, QuestionCde, QuestionCdeValueList
} from 'shared/form/form.model';
import { addFormIds, getLabel, iterateFe, iterateFes, iterateFeSync, noopSkipIterCb } from 'shared/form/fe';
import { canEditCuratedItem, isOrgCurator } from 'shared/system/authorizationShared';
import { getQuestionPriorByLabel } from 'shared/form/skipLogic';

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
        '../../../cde/public/components/dataElementView/view.style.scss'
    ],
})
export class FormViewComponent implements OnInit {
    @ViewChild('commentAreaComponent', {static: true}) commentAreaComponent!: DiscussAreaComponent;
    @ViewChild('copyFormContent', {static: true}) copyFormContent!: TemplateRef<any>;
    @ViewChild('mltPinModalCde', {static: true}) mltPinModalCde!: PinBoardModalComponent;
    @ViewChild('exportPublishModal', {static: true}) exportPublishModal!: TemplateRef<any>;
    @ViewChild('saveModal') saveModal!: SaveModalComponent;
    commentMode?: boolean;
    currentTab = 'preview_tab';
    dialogRef!: MatDialogRef<any>;
    draftSaving?: Promise<CdeForm>;
    elt!: CdeFormDraft;
    eltCopy?: CdeForm;
    exportToTab: boolean = false;
    formInput!: Dictionary<string>;
    hasComments = false;
    hasDrafts = false;
    highlightedTabs: string[] = [];
    isIe = isIe;
    isOrgCurator = isOrgCurator;
    savingText = '';
    tabsCommented: string[] = [];
    unsaved = false;
    missingCdes: string[] = [];
    validationErrors: LocatableError[] = [];

    ngOnInit() {
        this.route.queryParams.subscribe(() => {
            this.hasDrafts = false;
            this.loadElt(() => {
                this.orgHelperService.then(() => {
                    this.elt.usedBy = this.orgHelperService.getUsedBy(this.elt);
                }).catch(_noop);
            });
        });
    }

    constructor(private alert: AlertService,
                private dialog: MatDialog,
                public exportService: ExportService,
                private formViewService: FormViewService,
                private http: HttpClient,
                private localStorageService: LocalStorageService,
                private orgHelperService: OrgHelperService,
                public quickBoardService: QuickBoardListService,
                private ref: ChangeDetectorRef,
                private route: ActivatedRoute,
                private router: Router,
                private title: Title,
                private ucumService: UcumService,
                public userService: UserService
    ) {
        this.exportToTab = !!localStorageService.getItem('exportToTab');
    }

    canEdit() {
        return canEditCuratedItem(this.userService.user, this.elt);
    }

    createDataElement(q: FormQuestionDraft, cb: Cb) {
        if (!q.question.cde.newCde) {
            return;
        }
        const dataElement = {
            designations: q.question.cde.newCde.designations,
            definitions: q.question.cde.newCde.definitions,
            stewardOrg: {
                name: this.elt.stewardOrg.name
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
            classification: this.elt.classification,
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

    exportPublishForm() {
        this.http.post('/server/form/publish/' + this.elt._id, {
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

    eltLoad(getForm: Observable<CdeForm> | Promise<CdeForm> | CdeForm, cb = _noop) {
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

    eltLoaded(elt: CdeForm, cb = _noop) {
        if (elt) {
            if (elt.isDraft) {
                this.hasDrafts = true;
            }
            CdeForm.validate(elt);
            this.missingCdes = areDerivationRulesSatisfied(this.elt);
            addFormIds(this.elt);
            this.elt = elt;
            this.title.setTitle('Form: ' + Elt.getLabel(this.elt));
            this.loadComments(this.elt);
            this.validate();
            cb();
        }
    }

    loadComments(form: CdeForm, cb = _noop) {
        this.http.get<Comment[]>('/server/discuss/comments/eltId/' + form.tinyId).subscribe(res => {
            this.hasComments = res && (res.length > 0);
            this.tabsCommented = res.map(c => c.linkedTab + '_tab');
            cb();
        }, err => this.alert.httpErrorMessageAlert(err, 'Error loading comments.'));
    }

    loadElt(cb = _noop) {
        this.eltLoad(this.formViewService.fetchEltForEditing(this.route.snapshot.queryParams), cb);
    }

    loadHighlightedTabs($event: string[]) {
        this.highlightedTabs = $event;
    }

    loadPublished(cb = _noop) {
        this.eltLoad(this.formViewService.fetchPublished(this.route.snapshot.queryParams), cb);
    }

    hasDraftsAndLoggedIn() {
        if (!this.userService.loggedIn()) {
            if (this.hasDrafts) {
                this.hasDrafts = false;
            }
            if (this.elt.isDraft) {
                this.loadPublished();
            }
        }
        return this.hasDrafts;
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
        eltCopy.ids = [];
        eltCopy.sources = [];
        eltCopy.designations[0].designation = 'Copy of: ' + eltCopy.designations[0].designation;
        eltCopy.registrationState = {
            administrativeNote: 'Copy of: ' + this.elt.tinyId,
            registrationStatus: 'Incomplete',
        };
        this.dialogRef = this.dialog.open(this.copyFormContent, {width: '1200px'});
    }

    openExportPublishModal() {
        this.formInput = {};
        this.dialogRef = this.dialog.open(this.exportPublishModal, {width: '800px'});
    }

    pinAllCdesIntoBoard() {
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

        this.elt.formElements.forEach(doFormElement);
        this.mltPinModalCde.pinMultiple(cdes, this.mltPinModalCde.open());
    }

    publish() {
        this.validate(() => {
            if (this.validationErrors.length) {
                this.alert.addAlert('danger', 'Please fix all errors before publishing');
            } else {
                this.saveModal.openSaveModal();
            }
        });
    }

    removeAttachment(event: number) {
        this.http.post<CdeForm>('/server/attachment/form/remove', {
            index: event,
            id: this.elt._id
        }).subscribe(res => {
            this.elt = res;
            this.alert.addAlert('success', 'Attachment Removed.');
            this.ref.detectChanges();
        });
    }

    removeDraft() {
        this.http.delete('/server/form/draft/' + this.elt.tinyId, {responseType: 'text'}).subscribe(
            () => this.loadElt(() => this.hasDrafts = false),
            err => this.alert.httpErrorMessageAlert(err));
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
        return this.draftSaving = this.http.put<CdeForm>('/server/form/draft/' + this.elt.tinyId, this.elt)
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

    saveForm() {
        const saveFormImpl = () => {
            const newCdeQuestions: FormQuestionDraft[] = [];
            iterateFes(this.elt.formElements, undefined, undefined, (fe, cb) => {
                if (!fe.question.cde.tinyId && (fe as FormQuestionDraft).question.cde.newCde) {
                    newCdeQuestions.push(fe as FormQuestionDraft);
                }
                cb();
            }, () => {
                async_forEach(newCdeQuestions, (q: FormQuestionDraft, doneOneCde: Cb) => {
                    this.createDataElement(q, doneOneCde);
                }, () => {
                    const publish = () => {
                        const publishData = {_id: this.elt._id, tinyId: this.elt.tinyId, __v: this.elt.__v};
                        this.http.post('/server/form/publish', publishData).subscribe(res => {
                            if (res) {
                                this.hasDrafts = false;
                                this.loadElt(() => this.alert.addAlert('success', 'Form saved.'));
                            }
                        }, err => this.alert.httpErrorMessageAlert(err, 'Error publishing'));
                    };
                    if (newCdeQuestions.length) {
                        this.saveDraft().then(() => {
                            publish();
                        }, err => this.alert.httpErrorMessageAlert(err, 'Error saving form'));
                    } else {
                        publish();
                    }
                });
            });
        };

        if (this.draftSaving) {
            this.draftSaving.then(saveFormImpl, _noop);
        } else {
            saveFormImpl();
        }
    }

    scrollToDescriptionId(id: string) {
        this.currentTab = 'description_tab';
        this.router.navigate(['/formEdit'], {queryParams: {tinyId: this.elt.tinyId}, fragment: id});
    }

    setDefault(index: number) {
        this.http.post<CdeForm>('/server/attachment/form/setDefault',
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
            formData.append('id', this.elt._id);
            this.http.post<any>('/server/attachment/form/add', formData).subscribe(
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

    validate(cb: Cb = _noop): void {
        this.validationErrors.length = 0;
        this.validateNoFeCycle();
        this.validateRepeat();
        this.validateSkipLogic();
        this.validateDefinitions();
        this.validateUoms(cb);
    }

    validateDefinitions() {
        this.elt.definitions.forEach(def => {
            if (!def.definition || !def.definition.length) {
                this.validationErrors.push(new LocatableError('Definition may not be empty.', undefined));
            }
        });
    }

    validateNoFeCycle() {
        iterateFeSync(this.elt, (f: FormInForm, tinyId: string) => {
            if (f.inForm.form.tinyId === tinyId) {
                this.validationErrors.push(new LocatableError(
                    'Form or Subform refers to itself meaning the form never ends.', f.elementType + '_' + f.feId
                ));
            }
            return tinyId;
        }, undefined, undefined, this.elt.tinyId);
    }

    validateRepeat() {
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

        this.elt.formElements.forEach(fe => findExistingErrors(this.elt, fe));
    }

    validateSkipLogic() {
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

        this.elt.formElements.forEach(fe => findExistingErrors(this.elt, fe));
    }

    validateUoms(callback: Cb) {
        iterateFe(this.elt, noopSkipIterCb, undefined, (q, cb) => {
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
}
