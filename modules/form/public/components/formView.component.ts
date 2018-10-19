import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import async_forEach from 'async/forEach';
import _cloneDeep from 'lodash/cloneDeep';
import _noop from 'lodash/noop';
import { Subscription } from 'rxjs/Subscription';
import { forkJoin } from 'rxjs/observable/forkJoin';

import { AlertService } from 'alert/alert.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { UserService } from '_app/user.service';
import { SaveModalComponent } from 'adminItem/public/components/saveModal/saveModal.component';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { ExportService } from 'core/export.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { CompareHistoryContentComponent } from 'compare/compareHistory/compareHistoryContent.component';
import { SkipLogicValidateService } from 'form/public/skipLogicValidate.service';
import { UcumService } from 'form/public/ucum.service';
import { Cb, Comment, ObjectId } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm, FormElement, FormElementsContainer, FormInForm, QuestionCde } from 'shared/form/form.model';
import {
    addFormIds, areDerivationRulesSatisfied, getLabel, iterateFe, iterateFes, iterateFeSync, noopSkipIterCb
} from 'shared/form/fe';
import { httpErrorMessage } from 'widget/angularHelper';
import { isIe, scrollTo } from 'widget/browser';
import { MatDialog, MatDialogRef } from '@angular/material';

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
    drafts: CdeForm[] = [];
    draftSubscription: Subscription;
    elt: CdeForm;
    eltCopy?: CdeForm;
    formId?: ObjectId;
    formInput;
    hasComments;
    highlightedTabs = [];
    isIe = isIe;
    missingCdes: string[] = [];
    dialogRef: MatDialogRef<any>;
    savingText: string = '';
    tabsCommented: string[] = [];
    validationErrors: { message: string, id: string }[] = [];

    ngOnInit() {
        this.route.queryParams.subscribe(() => {
            this.loadForm(() => {
                this.elt.usedBy = this.orgHelperService.getUsedBy(this.elt);
            });
        });
    }

    constructor(private http: HttpClient,
                private ref: ChangeDetectorRef,
                public isAllowedModel: IsAllowedService,
                private orgHelperService: OrgHelperService,
                public quickBoardService: QuickBoardListService,
                private alert: AlertService,
                public userService: UserService,
                public exportService: ExportService,
                private route: ActivatedRoute,
                private router: Router,
                private ucumService: UcumService,
                private dialog: MatDialog
    ) {
    }

    canEdit() {
        return this.isAllowedModel.isAllowed(this.elt) && (this.drafts.length === 0 || this.elt.isDraft);
    }

    createDataElement(newCde: any, cb: Cb) {
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
            ids: newCde.ids
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

    formLoaded(elt: CdeForm, cb = _noop) {
        if (elt) {
            CdeForm.validate(elt);
            this.elt = elt;
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

    loadForm(cb = _noop) {
        this.userService.then(() => {
            this.http.get<CdeForm>('/draftForm/' + this.route.snapshot.queryParams['tinyId']).subscribe(
                res => {
                    if (res && this.isAllowedModel.isAllowed(res)) {
                        this.drafts = [res];
                        this.formLoaded(res, cb);
                    } else {
                        this.drafts = [];
                        this.loadPublished(cb);
                    }
                },
                err => {
                    // do not load form
                    this.alert.httpErrorMessageAlert(err);
                    this.formLoaded(null, cb);
                }
            );
        }, () => this.loadPublished(cb));
    }

    loadHighlightedTabs($event) {
        this.highlightedTabs = $event;
    }

    loadPublished(cb = _noop) {
        let formId = this.route.snapshot.queryParams['formId'];
        let url = '/form/' + this.route.snapshot.queryParams['tinyId'];
        let version = this.route.snapshot.queryParams['version'];
        if (version) url = url + "/version/" + version;
        if (formId) url = '/formById/' + formId;
        this.http.get<CdeForm>(url).subscribe(
            res => this.formLoaded(res, cb),
            () => this.router.navigate(['/pageNotFound'], {skipLocationChange: true})
        );
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
            registrationStatus: 'Incomplete',
            administrativeNote: 'Copy of: ' + this.elt.tinyId
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
        this.http.post<CdeForm>('/attachments/form/remove', {
            index: event,
            id: this.elt._id
        }).subscribe(res => {
            this.elt = res;
            this.alert.addAlert('success', 'Attachment Removed.');
            this.ref.detectChanges();
        });
    }

    removeDraft() {
        this.http.delete('/draftForm/' + this.elt.tinyId, {responseType: 'text'})
            .subscribe(() => {
                this.loadForm(() => this.drafts = []);
            }, err => this.alert.httpErrorMessageAlert(err));
    }

    saveDraft(cb: Cb<CdeForm>) {
        this.savingText = 'Saving ...';
        this.elt._id = this.formId;
        let username = this.userService.user.username;
        if (this.elt.updatedBy) {
            this.elt.updatedBy.username = username;
        } else {
            this.elt.updatedBy = {userId: undefined, username: username};
        }
        if (!this.elt.createdBy) {
            this.elt.createdBy = {userId: undefined, username: username};
        }
        this.elt.updated = new Date();
        if (this.draftSubscription) this.draftSubscription.unsubscribe();
        this.draftSubscription = this.http.post<CdeForm>('/draftForm/' + this.elt.tinyId, this.elt).subscribe(res => {
            this.elt.isDraft = true;
            if (!this.drafts.length) {
                this.drafts = [this.elt];
            }
            this.savingText = 'Saved';
            setTimeout(() => {
                this.savingText = '';
            }, 3000);
            this.missingCdes = areDerivationRulesSatisfied(this.elt);
            this.validate();
            if (cb) cb(res);
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
                        this.loadForm(() => this.alert.addAlert('success', 'Form saved.'));
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
        this.http.post<CdeForm>('/attachments/form/setDefault',
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
            this.http.post<any>('/attachments/form/add', formData).subscribe(
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

    // cb()
    validate(cb = _noop): void {
        this.validationErrors.length = 0;
        this.validateNoFeCycle();
        this.validateSkipLogic();
        this.validateUoms(cb);
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

    // cb()
    validateUoms(callback) {
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
        let tinyId = this.route.snapshot.queryParams['tinyId'];
        let draftEltObs = this.http.get<DataElement>('/draftForm/' + tinyId);
        let publishedEltObs = this.http.get<DataElement>('/form/' + tinyId);
        forkJoin([draftEltObs, publishedEltObs]).subscribe(res => {
            if (res.length = 2) {
                let newer = res[0];
                let older = res[1];
                this.dialogRef = this.dialog.open(CompareHistoryContentComponent,
                    {width: '800px', data: {newer: newer, older: older}});
            } else this.alert.addAlert('danger', 'Error loading view changes. ');
        }, err => this.alert.addAlert('danger', 'Error loading view change. ' + err));
    }

}
