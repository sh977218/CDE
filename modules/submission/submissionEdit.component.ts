import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { httpErrorMessage } from 'non-core/angularHelper';
import { fileInputToFormData, interruptEvent, openUrl } from 'non-core/browser';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { orderedSetAdd } from 'shared/array';
import { SubmissionAttachResponse } from 'shared/boundaryInterfaces/API/submission';
import { Submission, SubmissionAttachment } from 'shared/boundaryInterfaces/db/submissionDb';
import { administrativeStatuses } from 'shared/models.model';
import { canSubmissionReview } from 'shared/security/authorizationShared';

// type SubmissionTemplate = Omit<Submission, '_id' | 'endorsed' | 'dateModified' | 'dateSubmitted' | 'numberCdes' | 'submitterId'>;

const messages: Record<string, Record<string, string>> = {
    name: {
        minlength: 'Requires at at least 3 characters. ',
    },
    collectionUrl: {
        pattern: 'Requires a valid URL. ',
    },
    collectionDescription: {
        minlength: 'Requires at least 3 characters. ',
    },
    submitterEmail: {
        minlength: 'Requires at least 5 characters. ',
        email: 'Requires a valid email address. ',
    },
    submitterOrganization: {
        minlength: 'Requires at least 2 characters. ',
    },
    submitterNameMi: {
        maxlength: '2 characters maximum. ',
    },
    organizationEmail: {
        email: 'Requires a valid email address. ',
    },
    organizationUrl: {
        pattern: 'Requires a valid URL. ',
    },
    organizationPocMi: {
        maxlength: '2 characters maximum. ',
    },
    licenseInformation: {
        minlength: 'Requires at at least 3 characters. ',
    },
};

const validateUrl = Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');

@Component({
    templateUrl: './submissionEdit.component.html',
    styleUrls: ['./submissionEdit.component.scss'],
})
export class SubmissionEditComponent implements OnInit, OnDestroy {
    @Input() set submission(submission: Partial<Submission>) {
        this._submission = submission;
        this.defaultValues(this.submission);
    }
    get submission(): Partial<Submission> {
        return this._submission;
    }
    _submission: Partial<Submission> = {};
    allNlmCurators: string[] = [''];
    allOrgCurators: string[] = [''];
    allReviewers: string[] = [''];
    canSave: boolean = true;
    canSubmissionReview = canSubmissionReview;
    filteredNlmCurators: Observable<string[]>;
    filteredOrgCurators: Observable<string[]>;
    filteredReviewers: Observable<string[]>;
    page1: FormGroup<{
        additionalInformation: FormControl<string>;
        administrativeStatus: FormControl<string>;
        collectionDescription: FormControl<string>;
        collectionUrl: FormControl<string>;
        name: FormControl<string>;
        nihInitiative: FormControl<string>;
        nihInitiativeBranch: FormControl<string>;
        registrationStatus: FormControl<string>;
        version: FormControl<string>;
    }>;
    page1Submitted: boolean = false;
    page2: FormGroup<{
        organizationUrl: FormControl<string>;
        organizationEmail: FormControl<string>;
        organizationPocTitle: FormControl<string>;
        organizationPocFirst: FormControl<string>;
        organizationPocMi: FormControl<string>;
        organizationPocLast: FormControl<string>;
        submitterOrganization: FormControl<string>;
        submitterEmail: FormControl<string>;
        submitterNameTitle: FormControl<string>;
        submitterNameFirst: FormControl<string>;
        submitterNameMi: FormControl<string>;
        submitterNameLast: FormControl<string>;
        organizationCurators: FormControl<string[]>;
        governanceReviewers: FormControl<string[]>;
        nlmCurators: FormControl<string[]>;
    }>;
    page2Submitted: boolean = false;
    page3: FormGroup<{
        licensePublic: FormControl<boolean>;
        licenseAttribution: FormControl<boolean>;
        licensePermission: FormControl<boolean>;
        licenseCost: FormControl<boolean>;
        licenseTraining: FormControl<boolean>;
        licenseOther: FormControl<boolean>;
        licenseInformation: FormControl<string>;
        boolWorkbook: FormControl<boolean>;
        boolSupporting: FormControl<boolean>;
    }>;
    page3Submitted: boolean = false;
    page4Submitted: boolean = false;
    searchCtrlNlmCurator = new FormControl('');
    searchCtrlOrgCurator = new FormControl('');
    searchCtrlReviewer = new FormControl('');
    separatorKeysCodes: number[] = [ENTER, COMMA];
    unsubscribeUser?: () => void;
    userEmail: string = '';
    userFirstName: string = '';
    userLastName: string = '';
    validAdminStatus = administrativeStatuses;
    validRegStatuses = [
        'Preferred Standard',
        'Standard',
        'Qualified',
        'Recorded',
        'Candidate',
        'Incomplete',
        'Retired',
    ];

    constructor(
        private route: ActivatedRoute,
        private alert: AlertService,
        private formBuilder: NonNullableFormBuilder,
        private http: HttpClient,
        private router: Router,
        public userService: UserService
    ) {
        this.page1 = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            version: ['', Validators.required],
            collectionUrl: ['', [Validators.required, validateUrl]],
            collectionDescription: ['', [Validators.required, Validators.minLength(3)]],
            nihInitiative: ['', Validators.required],
            nihInitiativeBranch: [''],
            additionalInformation: [''],
            administrativeStatus: [
                { value: 'Not Endorsed', disabled: !canSubmissionReview(this.userService.user) },
                Validators.required,
            ],
            registrationStatus: [
                { value: 'Incomplete', disabled: !canSubmissionReview(this.userService.user) },
                Validators.required,
            ],
        });
        this.page2 = this.formBuilder.group({
            submitterEmail: [
                this.userService.user?.lastLoginInformation?.email || '',
                [Validators.required, Validators.minLength(5), Validators.email],
            ],
            submitterOrganization: ['', [Validators.required, Validators.minLength(2)]],
            submitterNameTitle: [''],
            submitterNameFirst: [this.userService.user?.lastLoginInformation?.firstName || '', Validators.required],
            submitterNameMi: ['', Validators.maxLength(2)],
            submitterNameLast: [this.userService.user?.lastLoginInformation?.lastName || '', Validators.required],
            organizationEmail: ['', [Validators.required, Validators.email]],
            organizationUrl: ['', [Validators.required, validateUrl]],
            organizationPocTitle: [''],
            organizationPocFirst: ['', Validators.required],
            organizationPocMi: ['', Validators.maxLength(2)],
            organizationPocLast: ['', Validators.required],
            organizationCurators: [{ value: [] as string[], disabled: !canSubmissionReview(this.userService.user) }],
            governanceReviewers: [
                { value: [] as string[], disabled: !canSubmissionReview(this.userService.user) },
                Validators.required,
            ],
            nlmCurators: [
                { value: [] as string[], disabled: !canSubmissionReview(this.userService.user) },
                Validators.required,
            ],
        });
        this.page3 = this.formBuilder.group(
            {
                licensePublic: [false],
                licenseAttribution: [false],
                licensePermission: [false],
                licenseCost: [false],
                licenseTraining: [false],
                licenseOther: [false],
                licenseInformation: ['', [Validators.required, Validators.minLength(3)]],
                boolWorkbook: [false, Validators.requiredTrue],
                boolSupporting: [false],
            },
            {
                validators: control =>
                    !control.get('licensePublic')?.value &&
                    !control.get('licenseAttribution')?.value &&
                    !control.get('licensePermission')?.value &&
                    !control.get('licenseCost')?.value &&
                    !control.get('licenseTraining')?.value &&
                    !control.get('licenseOther')?.value
                        ? { oneLicenseRequired: true }
                        : null,
            }
        );
        if (!this.unsubscribeUser) {
            this.unsubscribeUser = this.userService.subscribe(user => {
                if (user?.lastLoginInformation) {
                    this.userEmail = user.lastLoginInformation.email;
                    this.userFirstName = user.lastLoginInformation.firstName;
                    this.userLastName = user.lastLoginInformation.lastName;
                }
            });
        }

        this.filteredNlmCurators = this.searchCtrlNlmCurator.valueChanges.pipe(
            startWith(null),
            map((username: string | null) =>
                username
                    ? this.allNlmCurators.filter(u => u.toLowerCase().includes(username.toLowerCase()))
                    : this.allNlmCurators.slice()
            )
        );
        this.filteredOrgCurators = this.searchCtrlOrgCurator.valueChanges.pipe(
            startWith(null),
            map((username: string | null) =>
                username
                    ? this.allOrgCurators.filter(u => u.toLowerCase().includes(username.toLowerCase()))
                    : this.allOrgCurators.slice()
            )
        );
        this.filteredReviewers = this.searchCtrlReviewer.valueChanges.pipe(
            startWith(null),
            map((username: string | null) =>
                username
                    ? this.allReviewers.filter(u => u.toLowerCase().includes(username.toLowerCase()))
                    : this.allReviewers.slice()
            )
        );
    }

    ngOnInit() {
        this.route.queryParams.subscribe(() => {
            if (this.route.snapshot.queryParams._id) {
                this.http
                    .get<Submission>('/server/submission/' + this.route.snapshot.queryParams._id)
                    .toPromise()
                    .then(s => {
                        this.submission = s;
                        this.defaultValues(this.submission);
                        this.copySubmissionToForm();
                        return s;
                    });
            }
        });
    }

    ngOnDestroy() {
        if (this.unsubscribeUser) {
            this.unsubscribeUser();
            this.unsubscribeUser = undefined;
        }
    }

    addNlmCurator(event: MatChipInputEvent) {
        const value = (event.value || '').trim();
        if (value) {
            arrayControlSetAdd(this.page2.controls.nlmCurators, value);
        }
        event.chipInput!.clear();
        this.searchCtrlNlmCurator.setValue(null);
    }

    addOrgCurator(event: MatChipInputEvent) {
        const value = (event.value || '').trim();
        if (value) {
            arrayControlSetAdd(this.page2.controls.organizationCurators, value);
        }
        event.chipInput!.clear();
        this.searchCtrlOrgCurator.setValue(null);
    }

    addReviewer(event: MatChipInputEvent) {
        const value = (event.value || '').trim();
        if (value) {
            arrayControlSetAdd(this.page2.controls.governanceReviewers, value);
        }
        event.chipInput!.clear();
        this.searchCtrlReviewer.setValue(null);
    }

    attachmentUpload(location: 'attachmentWorkbook' | 'attachmentSupporting', event: Event) {
        if (!this.submission._id) {
            this.alert.addAlert('error', 'Need to save before attaching');
            return;
        }
        const inputElement = event.srcElement as HTMLInputElement;
        if (
            location === 'attachmentWorkbook' &&
            inputElement.files?.[0]?.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            this.alert.addAlert('error', 'The collection file needs to be a spreadsheet workbook.');
            return;
        }
        const formData = fileInputToFormData(inputElement);
        if (formData) {
            formData.append('id', this.submission._id);
            formData.append('location', location);
            this.http.post<SubmissionAttachResponse>('/server/submission/attach', formData).subscribe(r => {
                this.submission[location] = r;
                if (location === 'attachmentSupporting') {
                    this.page3.controls.boolSupporting.setValue(true);
                }
                if (location === 'attachmentWorkbook') {
                    this.page3.controls.boolWorkbook.setValue(true);
                }
                this.alert.addAlert('success', 'Attachment Saved');
            });
        }
    }

    close() {
        this.router.navigate(['/collection']);
    }

    copySubmissionToForm() {
        this.userService.then(() => {
            if (!canSubmissionReview(this.userService.user)) {
                if (!this.submission.administrativeStatus) {
                    this.submission.administrativeStatus = 'Not Endorsed';
                }
                if (!this.submission.registrationStatus) {
                    this.submission.registrationStatus = 'Incomplete';
                }
            }
            this.page1.patchValue(this.submission);
            this.page2.patchValue(this.submission);
            this.page3.patchValue(this.submission);
            this.page3.patchValue({
                boolSupporting: !!this.submission.attachmentSupporting,
                boolWorkbook: !!this.submission.attachmentWorkbook,
            });
            this.page1.markAsUntouched();
            this.page2.markAsUntouched();
            this.page3.markAsUntouched();
        });
    }

    defaultValues(submission: Partial<Submission>) {
        if (!submission.administrativeStatus) {
            submission.administrativeStatus = 'Not Endorsed';
        }
        if (!submission.registrationStatus) {
            submission.registrationStatus = 'Incomplete';
        }
        if (!submission.collectionUrl) {
            submission.collectionUrl = '';
        }
        if (!submission.collectionDescription) {
            submission.collectionDescription = '';
        }
        if (!submission.nihInitiative) {
            submission.nihInitiative = '';
        }
        if (!submission.submitterEmail) {
            this.userService.then(() => {
                submission.submitterEmail = this.userService.user?.email || '';
            });
        }
    }

    errorCustom3(code: string): boolean | undefined {
        return this.errorsShow(this.page3) && this.page3.getError(code);
    }

    errorMessage(group: FormGroup, controlName: string): string | undefined {
        const m = messages[controlName];
        if (!m || !this.errorsControlShow(group, controlName)) {
            return '';
        }
        return Object.keys(m).reduce((acc, key) => acc + (group.get(controlName)?.hasError(key) ? m[key] : ''), '');
    }

    errorRequired1(field: string): boolean | undefined {
        return (
            this.canSave &&
            this.page1.get(field)?.hasError('required') &&
            (this.page1Submitted || this.page1.get(field)?.dirty || this.page1.get(field)?.touched)
        );
    }

    errorRequired2(field: string): boolean | undefined {
        return (
            this.canSave &&
            this.page2.get(field)?.hasError('required') &&
            (this.page2Submitted || this.page2.get(field)?.dirty || this.page2.get(field)?.touched)
        );
    }

    errorRequired3(field: string): boolean | undefined {
        return (
            this.canSave &&
            this.page3.get(field)?.hasError('required') &&
            (this.page3Submitted || this.page3.get(field)?.dirty || this.page3.get(field)?.touched)
        );
    }

    errorsControlShow(group: FormGroup, controlName: string): boolean | undefined {
        return (
            this.canSave &&
            ((group === this.page1 && this.page1Submitted) ||
                (group === this.page2 && this.page2Submitted) ||
                (group === this.page3 && this.page3Submitted) ||
                group.get(controlName)?.dirty ||
                group.get(controlName)?.touched)
        );
    }

    errorsShow(group: FormGroup): boolean {
        return (
            this.canSave &&
            ((group === this.page1 && this.page1Submitted) ||
                (group === this.page2 && this.page2Submitted) ||
                (group === this.page3 && this.page3Submitted))
        );
    }

    forwardToExisting() {
        if (this.route.snapshot.queryParams._id) {
            return;
        }
        this.router.navigate(['/collection/edit'], {
            queryParams: {
                _id: this.submission._id,
            },
        });
    }

    isOrgPocSubmitterPoc(): boolean {
        const page = this.page2.value;
        return (
            page.submitterEmail === page.organizationEmail &&
            page.submitterNameTitle === page.organizationPocTitle &&
            page.submitterNameFirst === page.organizationPocFirst &&
            page.submitterNameMi === page.organizationPocMi &&
            page.submitterNameLast === page.organizationPocLast
        );
    }

    isSubmitterPocSubmitter() {
        const page = this.page2.value;
        return (
            page.submitterEmail === this.userEmail &&
            page.submitterNameTitle === '' &&
            page.submitterNameFirst === this.userFirstName &&
            page.submitterNameMi === '' &&
            page.submitterNameLast === this.userLastName
        );
    }

    openAttachment(event: Event, attachment?: SubmissionAttachment) {
        if (attachment) {
            openUrl(window.location.origin + '/server/system/data/' + attachment.fileId, event, true);
        } else {
            interruptEvent(event);
        }
    }

    openFileDialog(id: string) {
        const open = document.getElementById(id);
        if (open) {
            open.click();
        }
    }

    removeNlmCurator(username: string) {
        arrayControlSetRemove(this.page2.controls.nlmCurators, username);
    }

    removeOrgCurator(username: string) {
        arrayControlSetRemove(this.page2.controls.organizationCurators, username);
    }

    removeReviewer(username: string) {
        arrayControlSetRemove(this.page2.controls.governanceReviewers, username);
    }

    save(): Promise<Submission> {
        const submission: Partial<Submission> = Object.assign(
            this.submission,
            this.page1.value,
            this.page2.value,
            this.page3.value
        );
        if (!submission.name) {
            this.alert.addAlert('error', 'Name is required');
            return Promise.reject('Name is required');
        }
        if (!submission.version) {
            this.alert.addAlert('error', 'Version is required');
            return Promise.reject('Version is required');
        }
        this.defaultValues(submission);
        return this.http
            .put<Submission>('/server/submission/', submission)
            .toPromise()
            .then(
                s => {
                    this.submission = s;
                    this.forwardToExisting();
                    this.copySubmissionToForm();
                    return s;
                },
                (err: HttpErrorResponse) => {
                    this.alert.addAlert('fail', httpErrorMessage(err));
                    return Promise.reject(err);
                }
            );
    }

    saveAndExit() {
        this.save()
            .then(() => this.alert.addAlert('success', 'Saved'))
            .then(() => this.close());
    }

    saveIfChanged(page: FormGroup) {
        if (page.touched) {
            this.save().then(() => this.alert.addAlert('success', 'Progress Saved'));
        }
        return true;
    }

    selectedNlmCurator(event: MatAutocompleteSelectedEvent) {
        arrayControlSetAdd(this.page2.controls.nlmCurators, event.option.viewValue);
        this.searchCtrlNlmCurator.setValue(null);
    }

    selectedOrgCurator(event: MatAutocompleteSelectedEvent) {
        arrayControlSetAdd(this.page2.controls.organizationCurators, event.option.viewValue);
        this.searchCtrlOrgCurator.setValue(null);
    }

    selectedReviewer(event: MatAutocompleteSelectedEvent) {
        arrayControlSetAdd(this.page2.controls.governanceReviewers, event.option.viewValue);
        this.searchCtrlReviewer.setValue(null);
    }

    setOrgPocFromSubmitterPoc() {
        this.page2.controls.organizationEmail.setValue(this.page2.controls.submitterEmail.value);
        this.page2.controls.organizationPocTitle.setValue(this.page2.controls.submitterNameTitle.value);
        this.page2.controls.organizationPocFirst.setValue(this.page2.controls.submitterNameFirst.value);
        this.page2.controls.organizationPocMi.setValue(this.page2.controls.submitterNameMi.value);
        this.page2.controls.organizationPocLast.setValue(this.page2.controls.submitterNameLast.value);
    }

    setSubmitterPocFromSubmitter() {
        this.page2.controls.submitterEmail.setValue(this.userEmail);
        this.page2.controls.submitterNameTitle.setValue('');
        this.page2.controls.submitterNameFirst.setValue(this.userFirstName);
        this.page2.controls.submitterNameMi.setValue('');
        this.page2.controls.submitterNameLast.setValue(this.userLastName);
    }

    submit() {
        if (this.page1.invalid || this.page2.invalid || this.page3.invalid) {
            this.page1Submitted = true;
            this.page2Submitted = true;
            this.page3Submitted = true;
            this.page4Submitted = true;
            return;
        }
        this.save()
            .then(() => this.http.post('/server/submission/submit', { _id: this.submission._id }).toPromise())
            .then(() => this.alert.addAlert('info', 'Submitted'))
            .then(() => this.close());
    }

    updateNlmCurators() {
        this.http
            .get<string[]>('/server/user/nlmCuratorNames')
            .toPromise()
            .then(users => {
                this.allNlmCurators = users.length ? users : [''];
                this.searchCtrlNlmCurator.setValue(null);
            });
        this.page2.controls.nlmCurators.markAsTouched();
    }

    updateOrgCurators() {
        if (!this.page2.value.submitterOrganization) {
            return;
        }
        this.http
            .get<string[]>('/server/user/orgCuratorNames/' + this.page2.value.submitterOrganization)
            .toPromise()
            .then(users => {
                this.allOrgCurators = users.length ? users : [''];
                this.searchCtrlOrgCurator.setValue(null);
            });
        this.page2.controls.organizationCurators.markAsTouched();
    }

    updateReviewers() {
        this.http
            .get<string[]>('/server/user/governanceReviewerNames')
            .toPromise()
            .then(users => {
                this.allReviewers = users.length ? users : [''];
                this.searchCtrlReviewer.setValue(null);
            });
        this.page2.controls.governanceReviewers.markAsTouched();
    }
}

function arrayControlSetAdd(control: FormControl, value: string) {
    orderedSetAdd(control.value, value);
    control.setValue(control.value);
    touchedAndDirty(control);
}

function arrayControlSetRemove(control: FormControl, value: string) {
    const index = control.value.indexOf(value);
    if (index >= 0) {
        control.value.splice(index, 1);
        control.setValue(control.value);
        touchedAndDirty(control);
    }
}

function touchedAndDirty(control: FormControl) {
    control.markAsTouched();
    control.markAsDirty();
}