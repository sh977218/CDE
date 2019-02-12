import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { SaveModalComponent } from 'adminItem/public/components/saveModal/saveModal.component';
import async_forEach from 'async/forEach';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { ExportService } from 'core/export.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { FormViewService } from 'form/public/components/formView.service';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import _cloneDeep from 'lodash/cloneDeep';
import _noop from 'lodash/noop';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Cb, Comment, Elt, ObjectId } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm, FormElement, FormElementsContainer, FormInForm, QuestionCde } from 'shared/form/form.model';
import {
    addFormIds, areDerivationRulesSatisfied, getLabel, iterateFe, iterateFes, iterateFeSync, noopSkipIterCb
} from 'shared/form/fe';
import { canEditCuratedItem, isOrgCurator } from 'shared/system/authorizationShared';
import { httpErrorMessage } from 'core/angularHelper';
import { isIe, scrollTo } from 'core/browser';

class LocatableError {
    id: string;
    message: string;

    constructor(m: string, id: string) {
        this.id = id;
        this.message = m;
    }
}

@Component({
    selector: 'cde-form-view',
    templateUrl: 'formView.component.html',
    styles: [`
        @media (max-width: 767px) {
            .mobileViewH1 {
                font-size: 20px;
            }
        }
    `]
})
export class FormViewComponent implements OnInit {
    @ViewChild('commentAreaComponent') commentAreaComponent!: DiscussAreaComponent;
    @ViewChild('copyFormContent') copyFormContent!: TemplateRef<any>;
    @ViewChild('mltPinModalCde') mltPinModalCde!: PinBoardModalComponent;
    @ViewChild('exportPublishModal') exportPublishModal!: TemplateRef<any>;
    @ViewChild('saveModal') saveModal!: SaveModalComponent;
    commentMode;
    currentTab = 'preview_tab';
    dialogRef: MatDialogRef<any>;
    draftSubscription: Subscription;
    elt: CdeForm;
    eltCopy?: CdeForm;
    formId?: ObjectId;
    formInput;
    hasComments;
    hasDrafts = false;
    highlightedTabs = [];
    isIe = isIe;
    isOrgCurator = isOrgCurator;
    missingCdes: string[] = [];
    savingText: string = '';
    tabsCommented: string[] = [];
    validationErrors: { message: string, id: string }[] = [];

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
                private orgHelperService: OrgHelperService,
                public quickBoardService: QuickBoardListService,
                private ref: ChangeDetectorRef,
                private route: ActivatedRoute,
                private router: Router,
                private title: Title,
                private ucumService: UcumService,
                public userService: UserService
    ) {}

    canEdit() {
        return canEditCuratedItem(this.userService.user, this.elt);
    }

    createDataElement(newCde, cb: Cb) {
        let dataElement = {
            designations: newCde.designations,
            definitions: newCde.definitions,
            stewardOrg: {
                name: this.elt.stewardOrg.name
            },
            valueDomain: {
                datatype: newCde.datatype,
                identifiers: newCde.ids,
                ids: newCde.ids,
                datatypeText: newCde.datatypeText,
                datatypeNumber: newCde.datatypeNumber,
                datatypeDate: newCde.datatypeDate,
                datatypeTime: newCde.datatypeTime,
                permissibleValues: newCde.permissibleValues
            },
            classification: this.elt.classification,
            ids: newCde.ids,
            registrationState: {registrationStatus: 'Incomplete'}
        };
        this.http.post<DataElement>('/de', dataElement)
            .subscribe(res => {
                if (res.tinyId) newCde.tinyId = res.tinyId;
                if (res.version) newCde.version = res.version;
                if (cb) cb();
            }, err => {
                newCde.error = httpErrorMessage(err);
                this.alert.httpErrorMessageAlert(err);
            });
    }

    exportPublishForm() {
        this.http.post('/form/publish/' + this.elt._id, {
            publishedFormName: this.formInput.publishedFormName,
            endpointUrl: this.formInput.endpointUrl
        }).subscribe(
            () => {
                this.userService.reload();
                this.alert.addAlert('info', 'Done. Go to your profile to see all your published forms');
                this.dialogRef!.close();
            }, err => {
                this.alert.httpErrorMessageAlert(err, 'Error when publishing form.');
                this.dialogRef!.close();
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
            if (elt.isDraft) this.hasDrafts = true;
            CdeForm.validate(elt);
            this.elt = elt;
            this.title.setTitle('Form: ' + Elt.getLabel(this.elt));
            this.validate();
            this.loadComments(this.elt);
            this.formId = this.elt._id;
            this.missingCdes = areDerivationRulesSatisfied(this.elt);
            addFormIds(this.elt);
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

    loadHighlightedTabs($event) {
        this.highlightedTabs = $event;
    }

    loadPublished(cb = _noop) {
        this.eltLoad(this.formViewService.fetchPublished(this.route.snapshot.queryParams), cb);
    }

    openCopyElementModal() {
        this.eltCopy = _cloneDeep(this.elt);
        this.eltCopy['classification'] = this.elt.classification.filter(c => {
            return this.userService.userOrgs.indexOf(c.stewardOrg.name) !== -1;
        });
        this.eltCopy['registrationState.administrativeNote'] = 'Copy of: ' + this.elt.tinyId;
        delete this.eltCopy['tinyId'];
        delete this.eltCopy['_id'];
        delete this.eltCopy['origin'];
        delete this.eltCopy['created'];
        delete this.eltCopy['updated'];
        delete this.eltCopy['imported'];
        delete this.eltCopy['updatedBy'];
        delete this.eltCopy['createdBy'];
        delete this.eltCopy['version'];
        delete this.eltCopy['history'];
        delete this.eltCopy['changeNote'];
        delete this.eltCopy['comments'];
        delete this.eltCopy['forkOf'];
        delete this.eltCopy['views'];
        this.eltCopy['ids'] = [];
        this.eltCopy['sources'] = [];
        this.eltCopy['designations'] = this.eltCopy['designations'];
        this.eltCopy['designations'][0].designation = 'Copy of: ' + this.eltCopy['designations'][0].designation;
        this.eltCopy['definitions'] = this.eltCopy['definitions'];
        this.eltCopy['registrationState'] = {
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
        let cdes = [];
        let doFormElement = formElt => {
            if (formElt.elementType === 'question') {
                cdes.push(formElt.question.cde);
            } else {
                if (formElt.elementType === 'section' || formElt.elementType === 'form') {
                    formElt.formElements.forEach(doFormElement);
                }
            }
        };
        this.elt.formElements.forEach(doFormElement);
        this.mltPinModalCde.pinMultiple(cdes, this.mltPinModalCde.open());
    }

    publish() {
        this.validate(() => {
            if (this.validationErrors.length) {
                this.alert.addAlert("danger", "Please fix all errors before publishing");
            } else {
                this.saveModal.openSaveModal();
            }
        });
    }

    removeAttachment(event) {
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
        this.http.delete('/draftForm/' + this.elt.tinyId, {responseType: 'text'}).subscribe(
            () => this.loadElt(() => this.hasDrafts = false),
            err => this.alert.httpErrorMessageAlert(err));
    }

    saveDraft() {
        let username = this.userService.user.username;
        this.elt._id = this.formId;
        if (!this.elt.createdBy) {
            this.elt.createdBy = {userId: undefined, username: username};
        }
        this.elt.updated = new Date();
        if (!this.elt.updatedBy) {
            this.elt.updatedBy = {userId: undefined, username: username};
        }
        this.elt.updatedBy.username = username;

        this.elt.isDraft = true;
        this.hasDrafts = true;
        this.savingText = 'Saving ...';
        if (this.draftSubscription) this.draftSubscription.unsubscribe();
        this.draftSubscription = this.http.post<CdeForm>('/draftForm/' + this.elt.tinyId, this.elt).subscribe(() => {
            this.draftSubscription = undefined;
            this.savingText = 'Saved';
            setTimeout(() => {
                this.savingText = '';
            }, 3000);
            this.missingCdes = areDerivationRulesSatisfied(this.elt);
            this.validate();
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    saveForm() {
        let newCdes: QuestionCde[] = [];
        iterateFes(this.elt.formElements, undefined, undefined, (fe, cb) => {
            fe.question.cde.datatype = fe.question.datatype;
            if (!fe.question.cde.tinyId) newCdes.push(fe.question.cde);
            cb();
        }, () => {
            async_forEach(newCdes, (newCde, doneOneCde) => {
                this.createDataElement(newCde, doneOneCde);
            }, () => {
                this.http.put('/formPublish/' + this.elt.tinyId, this.elt).subscribe(res => {
                    if (res) {
                        this.hasDrafts = false;
                        this.loadElt(() => this.alert.addAlert('success', 'Form saved.'));
                    }
                }, () => this.alert.addAlert('danger', 'Error saving form.'));
            });
        });

    }

    scrollToDescriptionId(id: string) {
        this.currentTab = 'description_tab';
        setTimeout(scrollTo, 0, id);
    }

    setDefault(index: number) {
        this.http.post<CdeForm>('/server/attachment/form/setDefault',
            {
                index: index,
                state: this.elt.attachments[index].isDefault,
                id: this.elt._id
            }).subscribe(res => {
            this.elt = res;
            this.alert.addAlert('success', 'Saved');
            this.ref.detectChanges();
        });
    }

    upload(event) {
        if (event.srcElement && event.srcElement.files) {
            let files = event.srcElement.files;
            let formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('uploadedFiles', files[i]);
            }
            formData.append('id', this.elt._id);
            this.http.post<any>('/server/attachment/form/add', formData).subscribe(
                r => {
                    if (r.message) this.alert.addAlert('info', r);
                    else {
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
        this.validateSkipLogic();
        this.validateDefinitions();
        this.validateUoms(cb);
    }

    validateDefinitions() {
        this.elt.definitions.forEach(def => {
            if (!def.definition || !def.definition.length) {
                this.validationErrors.push(new LocatableError("Definition may not be empty.", undefined));
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

    validateSkipLogic() {
        let validationErrors = this.validationErrors;

        function findExistingErrors(parent: FormElementsContainer, fe: FormElement) {
            if (fe.skipLogic && !SkipLogicValidateService.validateSkipLogic(parent, fe)) {
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
        }, callback);
    }

    viewChanges() {
        let draft = this.elt;
        this.formViewService.fetchPublished(this.route.snapshot.queryParams).then(published => {
            this.dialogRef = this.dialog.open(CompareHistoryContentComponent,
                {width: '800px', data: {newer: draft, older: published}});
        }, err => this.alert.httpErrorMessageAlert(err, 'Error loading view changes.'));
    }
}
