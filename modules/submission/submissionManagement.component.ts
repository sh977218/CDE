import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { concat, deduplicate, orderedSetAdd, sortFirst } from 'shared/array';
import { Submission } from 'shared/boundaryInterfaces/db/submissionDb';
import { administrativeStatuses, curationStatus } from 'shared/models.model';
import { canSubmissionReview, canSubmissionSubmit } from 'shared/security/authorizationShared';
import { noop } from 'shared/util';
import { SubmissionViewComponent } from 'submission/submissionView.component';

interface ShowColumns {
    administrativeStatus: boolean;
    collectionTitle: boolean;
    collectionUrl: boolean;
    registrationStatus: boolean;
    dateSubmitted: boolean;
    dateModified: boolean;
    endorsed: boolean;
    nihInitiative: boolean;
    version: boolean;
    numberCdes: boolean;
    poc: boolean;
    orgPoc: boolean;
    submittingOrg: boolean;
    organizationUrl: boolean;
    organizationCurators: boolean;
    nlmCurators: boolean;
    governanceReviewers: boolean;
    license: boolean;
    licenseInformation: boolean;
    attachmentWorkbook: boolean;
    attachmentSupporting: boolean;
}
type SortFields = keyof ShowColumns | 'default';

const showColumnsSortProperties: Record<SortFields, keyof Submission> = {
    default: 'name',
    administrativeStatus: 'administrativeStatus',
    collectionTitle: 'name',
    collectionUrl: 'collectionUrl',
    registrationStatus: 'registrationStatus',
    dateSubmitted: 'dateSubmitted',
    dateModified: 'dateModified',
    endorsed: 'endorsed',
    nihInitiative: 'nihInitiative',
    version: 'version',
    numberCdes: 'numberCdes',
    poc: 'submitterEmail',
    orgPoc: 'organizationEmail',
    submittingOrg: 'submitterOrganization',
    organizationUrl: 'organizationUrl',
    organizationCurators: 'organizationCurators',
    nlmCurators: 'nlmCurators',
    governanceReviewers: 'governanceReviewers',
    license: 'licensePublic',
    licenseInformation: 'licenseInformation',
    attachmentWorkbook: 'attachmentWorkbook',
    attachmentSupporting: 'attachmentSupporting',
};
const showColumnsAll: Readonly<ShowColumns> = Object.freeze({
    administrativeStatus: true,
    collectionTitle: true,
    collectionUrl: true,
    dateModified: true,
    dateSubmitted: true,
    endorsed: true,
    nihInitiative: true,
    numberCdes: true,
    registrationStatus: true,
    submittingOrg: true,
    version: true,
    poc: true,
    orgPoc: true,
    organizationUrl: true,
    organizationCurators: true,
    nlmCurators: true,
    governanceReviewers: true,
    license: true,
    licenseInformation: true,
    attachmentWorkbook: true,
    attachmentSupporting: true,
});
const showColumnsDefault: Readonly<ShowColumns> = Object.freeze({
    administrativeStatus: true,
    collectionTitle: true,
    collectionUrl: false,
    dateModified: true,
    dateSubmitted: true,
    endorsed: false,
    nihInitiative: false,
    numberCdes: true,
    registrationStatus: true,
    submittingOrg: true,
    version: true,
    poc: true,
    orgPoc: true,
    organizationUrl: false,
    organizationCurators: false,
    nlmCurators: false,
    governanceReviewers: false,
    license: false,
    licenseInformation: false,
    attachmentWorkbook: false,
    attachmentSupporting: false,
});
const showColumnsNone: Readonly<ShowColumns> = Object.freeze({
    administrativeStatus: false,
    collectionTitle: true,
    collectionUrl: false,
    dateModified: false,
    dateSubmitted: false,
    endorsed: false,
    nihInitiative: false,
    numberCdes: false,
    registrationStatus: false,
    submittingOrg: true,
    version: false,
    poc: false,
    orgPoc: false,
    organizationUrl: false,
    organizationCurators: false,
    nlmCurators: false,
    governanceReviewers: false,
    license: false,
    licenseInformation: false,
    attachmentWorkbook: false,
    attachmentSupporting: false,
});

@Component({
    templateUrl: './submissionManagement.component.html',
    styleUrls: ['./submissionManagement.component.scss'],
})
export class SubmissionManagementComponent {
    adminStatuses = concat(administrativeStatuses as readonly string[] as string[]).sort();
    collectionTitles: string[] = [];
    regStatus = concat(curationStatus as readonly string[] as string[]).sort();
    displaySubmissions: Submission[] = [];
    filterCollectionTiles: string = '';
    filterSubmittingOrgs: string = '';
    filteredCollectionTitles: string[] = [];
    filteredSubmissions: Submission[] = [];
    filteredSubmittingOrgs: string[] = [];
    mode?: 'filters' | 'hide';
    openIndex: number | null = null;
    page: number = 0;
    pageSize: number = 25;
    queriedSubmissions: Submission[] = [];
    searchTerm: string = '';
    searchTermInput: string = '';
    selectedAdminStatuses: any = {};
    selectedCollectionTitles: any = {};
    selectedRegStatuses: any = {};
    selectedSubmittingOrgs: any = {};
    showColumn: ShowColumns = Object.assign({}, showColumnsDefault);
    showColumnsGroup: 'all' | 'default' | 'none' | 'user' = 'default';
    sortField: SortFields = 'default';
    sortReverse: boolean = false;
    submissions: Submission[] = [];
    submittingOrgs: string[] = [];

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        private dialog: MatDialog,
        private userService: UserService
    ) {
        this.userService.then(user => this.reload(), noop);
    }

    approve(submission: Submission) {
        this.alert.addAlert('info', 'Not Ready Yet');
    }

    canEdit() {
        return canSubmissionSubmit(this.userService.user);
    }

    canReview() {
        return canSubmissionReview(this.userService.user);
    }

    clearAll() {
        this.searchTermInput = '';
        this.search();
    }

    decline(submission: Submission) {
        this.http
            .post('/server/submission/decline', { _id: submission._id })
            .toPromise()
            .then(() => this.alert.addAlert('info', 'Declined'))
            .then(() => this.reload());
    }

    delete(submission: Submission) {
        this.http
            .delete('/server/submission/' + submission._id)
            .toPromise()
            .then(() => this.alert.addAlert('info', 'Deleted'))
            .then(() => this.reload());
    }

    filterByCollectionTitles() {
        this.filteredCollectionTitles = this.collectionTitles.filter(s => s.includes(this.filterCollectionTiles));
    }

    filterBySubmittingOrgs() {
        this.filteredSubmittingOrgs = this.submittingOrgs.filter(s => s.includes(this.filterSubmittingOrgs));
    }

    filterSubmissions() {
        this.filteredSubmissions = concat(this.queriedSubmissions);
        let filter = this.getFilter(this.selectedSubmittingOrgs);
        if (filter.length) {
            this.filteredSubmissions = this.filteredSubmissions.filter(s => filter.includes(s.submitterOrganization));
        }
        filter = this.getFilter(this.selectedCollectionTitles);
        if (filter.length) {
            this.filteredSubmissions = this.filteredSubmissions.filter(s =>
                filter.includes(getFilterCollectionTitle(s))
            );
        }
        filter = this.getFilter(this.selectedAdminStatuses);
        if (filter.length) {
            this.filteredSubmissions = this.filteredSubmissions.filter(s =>
                filter.includes(s.administrativeStatus || '')
            );
        }
        filter = this.getFilter(this.selectedRegStatuses);
        if (filter.length) {
            this.filteredSubmissions = this.filteredSubmissions.filter(s => filter.includes(s.registrationStatus));
        }
        this.pageChange();
    }

    generateFilterLists() {
        this.filterCollectionTiles = '';
        this.filterSubmittingOrgs = '';
        this.selectedAdminStatuses = {};
        this.selectedCollectionTitles = {};
        this.selectedRegStatuses = {};
        this.selectedSubmittingOrgs = {};
        let endorsedFirst = sortFirst(sortSubmissions(this.queriedSubmissions, 'name'), s => s.endorsed);
        this.filteredCollectionTitles = this.collectionTitles = endorsedFirst.map(getFilterCollectionTitle);
        endorsedFirst = sortFirst(sortSubmissions(this.queriedSubmissions, 'submitterOrganization'), s => s.endorsed);
        this.filteredSubmittingOrgs = this.submittingOrgs = deduplicate(
            endorsedFirst.map(s => s.submitterOrganization)
        );
    }

    getFilter(arr: any): string[] {
        return Object.keys(arr).filter(key => arr[key]);
    }

    getSortState(field: SortFields) {
        const neutral = 'swap_vert'; // 'height';
        const ascending = 'arrow_downward';
        const descending = 'arrow_upward';
        if (field === this.sortField) {
            return this.sortReverse ? descending : ascending;
        }
        return neutral;
    }

    loadSubmissions(): Promise<void> {
        if (!this.canEdit() && !this.canReview()) {
            this.submissions = [];
            return Promise.resolve();
        }
        return this.http
            .get<Submission[]>('/server/submission/')
            .toPromise()
            .then(response => {
                this.submissions = response;
            });
    }

    pageChange(page?: number, pageSize?: number) {
        if (typeof page === 'number') {
            this.page = page;
        }
        if (pageSize) {
            this.pageSize = pageSize;
        }
        this.displaySubmissions = this.filteredSubmissions.slice(
            this.page * this.pageSize,
            (this.page + 1) * this.pageSize
        );
    }

    reload() {
        this.loadSubmissions().then(() => {
            this.search();
            if (!this.searchTerm) {
                sortSubmissions(this.filteredSubmissions, 'name');
                this.filteredSubmissions = sortFirst(
                    this.filteredSubmissions,
                    s => s.administrativeStatus === 'NLM Review'
                );
            }
            this.pageChange();
        });
    }

    search() {
        this.searchTerm = this.searchTermInput;
        if (this.searchTerm) {
            this.queriedSubmissions = [];
            this.submissions
                .filter(s => s.name?.includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
            this.submissions
                .filter(s => s.collectionDescription?.includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
            this.submissions
                .filter(s => s.collectionUrl?.includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
            this.submissions
                .filter(s => s.administrativeStatus?.includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
            this.submissions
                .filter(s => s.registrationStatus?.includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
            this.submissions
                .filter(s => s.nihInitiative?.includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
            this.submissions
                .filter(s => s.version?.includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
            this.submissions
                .filter(s => (s.numberCdes + '').includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
            this.submissions
                .filter(s => s.submitterEmail?.includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
            this.submissions
                .filter(s => s.submitterOrganization?.includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
            this.submissions
                .filter(s => s.organizationEmail?.includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
            this.submissions
                .filter(s => s.organizationUrl?.includes(this.searchTerm))
                .forEach(s => orderedSetAdd(this.queriedSubmissions, s));
        } else {
            this.queriedSubmissions = concat(this.submissions);
        }

        this.generateFilterLists();
        this.filterSubmissions();
    }

    setSort(field: SortFields) {
        if (this.sortField === field) {
            this.sortReverse = !this.sortReverse;
        } else {
            this.sortField = field;
            this.sortReverse = false;
        }
        sortSubmissions(this.filteredSubmissions, showColumnsSortProperties[this.sortField], this.sortReverse);
        this.pageChange();
    }

    showColumns() {
        if (showColumnsEqual(this.showColumn, showColumnsAll)) {
            this.showColumnsGroup = 'all';
        } else if (showColumnsEqual(this.showColumn, showColumnsDefault)) {
            this.showColumnsGroup = 'default';
        } else if (showColumnsEqual(this.showColumn, showColumnsNone)) {
            this.showColumnsGroup = 'none';
        } else {
            this.showColumnsGroup = 'user';
        }
    }

    showColumnsAll() {
        this.showColumn = Object.assign(this.showColumn, showColumnsAll);
    }

    showColumnsDefault() {
        this.showColumn = Object.assign(this.showColumn, showColumnsDefault);
    }

    showColumnsNone() {
        this.showColumn = Object.assign(this.showColumn, showColumnsNone);
    }

    view(submission: Submission) {
        const dialogRef = this.dialog.open(SubmissionViewComponent, { height: '95%', width: '90%' });
        dialogRef.componentInstance.submission = submission;
        dialogRef.afterClosed().subscribe(() => this.reload());
    }
}

function compareBooleanFn(prop: keyof Submission) {
    return (a: Submission, b: Submission) => (!!a[prop] && !b[prop] ? -1 : !a[prop] && !!b[prop] ? 1 : 0);
}

function compareNumberFn(prop: keyof Submission) {
    return (a: Submission, b: Submission) => a[prop] - b[prop];
}

function compareStringFn(prop: keyof Submission) {
    function str(submission: Submission): string {
        return submission[prop] || '\x7F'; // sort null last
    }
    return (a: Submission, b: Submission) => (str(a) > str(b) ? 1 : str(a) < str(b) ? -1 : 0);
}

function getFilterCollectionTitle(s: Submission) {
    return s.name + (s.numberCdes ? ` (${s.numberCdes})` : '');
}

function showColumnsEqual(left: ShowColumns, right: ShowColumns): boolean {
    return (
        left.administrativeStatus === right.administrativeStatus &&
        left.attachmentSupporting === right.attachmentSupporting &&
        left.attachmentWorkbook === right.attachmentWorkbook &&
        left.collectionTitle === right.collectionTitle &&
        left.collectionUrl === right.collectionUrl &&
        left.dateModified === right.dateModified &&
        left.dateSubmitted === right.dateSubmitted &&
        left.endorsed === right.endorsed &&
        left.governanceReviewers === right.governanceReviewers &&
        left.license === right.license &&
        left.licenseInformation === right.licenseInformation &&
        left.nihInitiative === right.nihInitiative &&
        left.nlmCurators === right.nlmCurators &&
        left.numberCdes === right.numberCdes &&
        left.organizationCurators === right.organizationCurators &&
        left.organizationUrl === right.organizationUrl &&
        left.registrationStatus === right.registrationStatus &&
        left.submittingOrg === right.submittingOrg &&
        left.poc === right.poc &&
        left.orgPoc === right.orgPoc &&
        left.version === right.version
    );
}

function sortSubmissions(arr: Submission[], propertyName: keyof Submission, reverse?: boolean): Submission[] {
    if (propertyName === 'numberCdes') {
        arr.sort(compareNumberFn(propertyName));
    } else if (propertyName === 'endorsed') {
        arr.sort(compareBooleanFn(propertyName));
    } else {
        arr.sort(compareStringFn(propertyName));
    }
    if (reverse) {
        arr.reverse();
    }
    return arr;
}
