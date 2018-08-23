import { HttpClient } from '@angular/common/http';
import {
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Type,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger, MatPaginator } from '@angular/material';
import { NavigationStart } from '@angular/router';
import { NgbModal, NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import _noop from 'lodash/noop';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { debounceTime, map } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

import { AlertService } from '_app/alert.service';
import { BackForwardService } from '_app/backForward.service';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { ExportService } from 'core/export.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { SearchSettings } from 'search/search.model';
import {
    CbErr,
    CurationStatus, ElasticQueryResponse, ElasticQueryResponseAggregationBucket, ElasticQueryResponseHit, Elt,
    Organization
} from 'shared/models.model';
import { DataType } from 'shared/de/dataElement.model';
import { hasRole, isSiteAdmin } from 'shared/system/authorizationShared';
import { orderedList, statusList } from 'shared/system/regStatusShared';
import { trackByKey, trackByName } from 'widget/angularHelper';
import { scrollTo } from 'widget/browser';

export const searchStyles: string = `
    #searchResultInfoBar {
        font-size: 16.5px;
        vertical-align: middle;
    }
    .treeTitle {
        display: inline-block;
        font-weight: bold;
        text-indent: -1px;
    }
    .treeItem {
        margin-left: 15px;
    }
    .treeItemIcon {
    }
    .treeItemText {
        font-size: 80%;
        word-wrap: break-word;
        margin-left: .2rem;
    }
    .treeParent {
        line-height: 1;
        margin-bottom: .2rem;
        margin-top: .2rem;
        padding-left: 10px;
        text-indent: -5px;
    }
    .treeCurrent {
        cursor: default;
        font-weight: bolder;
        line-height: 1;
        margin-bottom: .2rem;
        margin-top: .2rem;
        text-indent: -1px;
    }
    .treeChild {
        line-height: 1;
        margin-bottom: .2rem;
        margin-top: .2rem;
        padding-left: 10px;
        text-indent: -5px;
    }
    .cdeFieldset > div {
        font-size: 16px;
    }
    .welcomeCount {
        bottom: 1px;
        right: 40px;
        position: absolute;
        background-color: white;
        padding: 0 5px 0 5px;
    }
    .welcomeDetailIcon {
        position: absolute !important;
        right: 21px;
        top: 30px;
        color: lightslategrey;
        font-size: 1.5em !important;
        border: 1px solid rgba(128, 128, 128, 0.35);
        border-radius: 28px;
        width: 25px;
        display: block;
        text-align: center;
    }
    .welcomeDetailIcon:hover {
        background-color: #337ab7;
        color: white;
    }
    .badge-success {
        background-color: #087721;
    }
    .badge-secondary {
        background-color: #70777d;
    }
`;

export abstract class SearchBaseComponent implements OnDestroy, OnInit {
    @Input() searchSettingsInput?: SearchSettings;
    @HostListener('window:beforeunload') unload() {
        if (/^\/(cde|form)\/search$/.exec(location.pathname)) {
            window.sessionStorage['nlmcde.scroll.' + location.pathname + location.search] = window.scrollY;
        }
    }
    @ViewChild('orgDetailsModal') orgDetailsModal!: NgbModal;
    @ViewChild('pinModal', {read: ViewContainerRef}) pinContainer!: ViewContainerRef;
    @ViewChild('tbset') public tabset!: NgbTabset;
    @ViewChild('validRulesModal') validRulesModal!: NgbModal;
    @ViewChild('autoCompleteInput', {read: MatAutocompleteTrigger}) autoCompleteInput!: MatAutocompleteTrigger;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    add = new EventEmitter<any>();
    addMode?: string;
    aggregations: any;
    altClassificationFilterMode?: boolean;
    autocompleteSuggestions?: string[];
    byTopic?: boolean;
    cutoffIndex: any;
    elts?: Elt[];
    embedded = false;
    exporters: {[format: string]: {id: string, display: string}} = {
        json: {id: 'jsonExport', display: 'JSON Export'},
        xml: {id: 'xmlExport', display: 'XML Export'}
    };
    filterMode = true;
    lastQueryTimeStamp?: number;
    private lastTypeahead: {[term: string]: string} = {};
    module!: 'cde'|'form';
    numPages: any;
    orgs?: Organization[];
    orgHtmlOverview?: string;
    pinComponent!: Type<PinBoardModalComponent>;
    pinModalComponent: any;
    previousUrl?: string;
    resultsView = '';
    resultPerPage = 20;
    routerSubscription: Subscription;
    searchSettings: SearchSettings = new SearchSettings;
    searchedTerm?: string;
    searchTermFC: FormControl = new FormControl();
    took: any;
    topics: any;
    topicsKeys: string[] = [];
    totalItems: any;
    totalItemsLimited: any;
    trackByKey = trackByKey;
    trackByName = trackByName;
    validRulesStatus?: CurationStatus;
    view?: 'welcome'|'results';

    constructor(protected _componentFactoryResolver: any,
                protected alert: AlertService,
                protected backForwardService: BackForwardService,
                protected elasticService: ElasticService,
                protected exportService: ExportService,
                protected http: HttpClient,
                protected modalService: any,
                protected orgHelperService: OrgHelperService,
                protected route: any,
                protected router: any,
                protected userService: UserService) {
        this.searchSettings.page = 1;

        this.routerSubscription = this.router.events.subscribe(e => {
            if (this.previousUrl && e instanceof NavigationStart) {
                if (/^\/(cde|form)\/search/.exec(this.previousUrl)) this.scrollHistorySave();
                this.previousUrl = '';
            }
        });

        this.filterMode = $(window).width() >= 768;
    }

    ngOnDestroy() {
        if (this.routerSubscription) this.routerSubscription.unsubscribe();
    }

    ngOnInit() {
        // TODO: remove OnInit when OnChanges inputs is implemented for Dynamic Components
        this.route.queryParams.subscribe(() => this.search());

        this.searchTermFC.valueChanges.subscribe(v => this.searchSettings.q = v);

        this.searchTermFC.valueChanges
            .pipe(debounceTime(500))
            .subscribe(term => {
                term.length >= 3
                    ? this.http.post<ElasticQueryResponseHit[]>('/' + this.module + 'Completion/' + encodeURIComponent(term),
                        this.elasticService.buildElasticQuerySettings(this.searchSettings))
                        .pipe(
                        map(hits => {
                                let final = new Set();
                                this.lastTypeahead = {};
                                hits.forEach(e => {
                                    this.lastTypeahead[e._source.primaryNameSuggest] = e._id;
                                    final.add(e._source.primaryNameSuggest);
                                });
                                return Array.from(final);
                            })
                        )
                        .subscribe(res => this.autocompleteSuggestions = res)
                    : EmptyObservable.create<any[]>();
            });
    }

    addDatatypeFilter(datatype: DataType) {
        if (!this.searchSettings.datatypes) this.searchSettings.datatypes = [];
        let index = this.searchSettings.datatypes.indexOf(datatype);
        if (index > -1) this.searchSettings.datatypes.splice(index, 1);
        else this.searchSettings.datatypes.push(datatype);

        this.doSearch();
    }

    addStatusFilter(status: CurationStatus) {
        if (!this.searchSettings.regStatuses) this.searchSettings.regStatuses = [];
        let index = this.searchSettings.regStatuses.indexOf(status);
        if (index > -1) this.searchSettings.regStatuses.splice(index, 1);
        else this.searchSettings.regStatuses.push(status);

        this.doSearch();
    }

    alterOrgFilter(orgName: string) {
        let orgToAlter = this.getCurrentSelectedOrg();

        if (orgToAlter === undefined) {
            if (this.altClassificationFilterMode) {
                this.searchSettings.selectedOrgAlt = orgName;
            } else {
                this.searchSettings.selectedOrg = orgName;
            }
        } else {
            if (this.altClassificationFilterMode) this.searchSettings.classificationAlt.length = 0;
            else this.searchSettings.classification.length = 0;
        }
        delete this.aggregations.groups;
        if (this.isSearched()) {
            this.doSearch();
            if (!this.embedded) SearchBaseComponent.focusClassification();
        } else this.reset();
    }

    browseOrg(orgName: string) {
        window.scrollTo(0, 0);

        this.searchSettings.selectedOrg = orgName;

        this.doSearch();
        if (!this.embedded) scrollTo('top');
    }

    browseTopic(topic: string) {
        this.searchSettings.meshTree = topic;

        this.doSearch();
        if (!this.embedded) scrollTo('top');
    }

    browseByTopic(event: NgbTabChangeEvent) {
        this.byTopic = event.nextId !== 'browseByClassification';
        this.doSearch();
    }

    clearSelectedClassifications() {
        this.searchSettings.selectedOrg = undefined;
        this.searchSettings.classification.length = 0;

        if (this.hasSelectedClassificationsAlt()) {
            this.searchSettings.selectedOrg = this.searchSettings.selectedOrgAlt;
            if (this.searchSettings.classificationAlt.length > 0) {
                this.searchSettings.classification = this.searchSettings.classificationAlt;
                this.searchSettings.classificationAlt = [];
            }
        }

        this.clearSelectedClassificationsAlt();
    }

    clearSelectedClassificationsAlt() {
        this.altClassificationFilterMode = false;
        this.searchSettings.selectedOrgAlt = undefined;
        this.searchSettings.classificationAlt.length = 0;

        this.doSearch();
    }

    clearSelectedDatatypes() {
        if (this.searchSettings.datatypes) {
            this.searchSettings.datatypes.length = 0;

            this.doSearch();
        }
    }

    clearSelectedStatuses() {
        if (this.searchSettings.regStatuses) {
            this.searchSettings.regStatuses.length = 0;

            this.doSearch();
        }
    }

    clearSelectedTopics() {
        this.searchSettings.meshTree = '';

        this.doSearch();
    }

    static compareObjName(a: any, b: any): number {
        return SearchBaseComponent.compareString(a.name, b.name);
    }

    static compareString(a: string, b: string): number {
        if (a > b) return 1;
        if (a < b) return -1;
        if (a === b) return 0;
        return NaN;
    }

    displayValidation(): boolean {
        if (!this.userService.user) {
            return false;
        }
        let org = this.searchSettings.selectedOrg;
        let curatorOf = this.userService.user.orgAdmin.concat(this.userService.user.orgCurator);
        return org && curatorOf.indexOf(org) > -1 || hasRole(this.userService.user, 'OrgAuthority');
    }

    doSearch() {
        if (!this.embedded) this.redirect(this.generateSearchForTerm());
        else this.reload();
    }

    fakeNextPageLink() {
        let p = (this.totalItemsLimited / this.resultPerPage > 1)
            ? (this.searchSettings.page ? this.searchSettings.page : 1) + 1 : 1;
        return this.generateSearchForTerm(p);
    }

    private filterOutWorkingGroups(cb: CbErr) {
        this.userService.catch(_noop).then(user => {
            this.orgHelperService.then(() => {
                this.aggregations.orgs.buckets = this.aggregations.orgs.orgs.buckets.filter((bucket: ElasticQueryResponseAggregationBucket) =>
                    this.orgHelperService.showWorkingGroup(bucket.key) || isSiteAdmin(user)
                );
                cb();
            }, cb);
        });
    }

    static focusClassification() {
        document.getElementById('classificationListHolder')!.focus();
    }

    static focusTopic() {
        document.getElementById('meshTreesListHolder')!.focus();
    }

    generateSearchForTerm(pageNumber = 0) {
        // TODO: replace with router
        let searchTerms: any = {};
        if (this.searchSettings.q) searchTerms.q = this.searchSettings.q;
        if (this.searchSettings.regStatuses && this.searchSettings.regStatuses.length > 0) {
            searchTerms.regStatuses = this.searchSettings.regStatuses.join(';');
        }
        if (this.searchSettings.datatypes && this.searchSettings.datatypes.length > 0) {
            searchTerms.datatypes = this.searchSettings.datatypes.join(';');
        }
        if (this.searchSettings.selectedOrg) searchTerms.selectedOrg = this.searchSettings.selectedOrg;
        if (this.searchSettings.classification.length > 0) {
            searchTerms.classification = this.searchSettings.classification.join(';');
        }
        if (this.searchSettings.selectedOrgAlt) searchTerms.selectedOrgAlt = this.searchSettings.selectedOrgAlt;
        if (this.altClassificationFilterMode && this.searchSettings.classificationAlt.length > 0) {
            searchTerms.classificationAlt = this.searchSettings.classificationAlt.join(';');
        }
        if (pageNumber > 1) searchTerms.page = pageNumber;
        else if (this.searchSettings.page && this.searchSettings.page > 1) searchTerms.page = this.searchSettings.page;
        if (this.searchSettings.meshTree) searchTerms.topic = this.searchSettings.meshTree;
        if (this.byTopic && !this.isSearched()) searchTerms.byTopic = 1;
        return searchTerms;
    }

    getCurrentSelectedClassification(): string[] {
        return this.altClassificationFilterMode
            ? this.searchSettings.classificationAlt
            : this.searchSettings.classification;
    }

    getCurrentSelectedOrg() {
        return this.altClassificationFilterMode
            ? this.searchSettings.selectedOrgAlt
            : this.searchSettings.selectedOrg;
    }

    getCurrentSelectedTopic() {
        return this.searchSettings.meshTree ? this.searchSettings.meshTree.split(';') : [];
    }

    getRegStatusHelp(name: string) {
        let result = '';
        statusList.forEach(function (s) { // jshint ignore:line
            if (s.name === name) result = s.help;
        });
        return result;
    }

    static getRegStatusIndex(rg: ElasticQueryResponseAggregationBucket) {
        return orderedList.indexOf(rg.key);
    }

    // Create string representation of what filters are selected. Use the hasSelected...() first.
    getSelectedClassifications(): string {
        return this.searchSettings.selectedOrg + (
            this.searchSettings.classification && this.searchSettings.classification.length > 0
                ? ' > ' + this.searchSettings.classification.join(' > ')
                : ''
        );
    }

    getSelectedClassificationsAlt(): string {
        return this.searchSettings.selectedOrgAlt + (
            this.searchSettings.classificationAlt.length > 0
                ? ' > ' + this.searchSettings.classificationAlt.join(' > ')
                : ''
        );
    }

    getSelectedDatatypes() {
        return this.searchSettings.datatypes.join(', ');
    }

    getSelectedStatuses() {
        return this.searchSettings.regStatuses.join(', ');
    }

    getSelectedTopics() {
        let res = this.searchSettings.meshTree.split(';').join(' > ');
        return res.length > 50 ? res.substr(0, 49) + '...' : res;
    }

    hasSelectedClassifications() {
        return this.searchSettings.selectedOrg;
    }

    hasSelectedClassificationsAlt() {
        return this.searchSettings.selectedOrgAlt;
    }

    hasSelectedDatatypes() {
        return this.searchSettings.datatypes && this.searchSettings.datatypes.length > 0;
    }

    hasSelectedStatuses() {
        return this.searchSettings.regStatuses
            && this.searchSettings.regStatuses.length > 0
            && this.searchSettings.regStatuses.length !== 6;
    }

    hasSelectedTopics() {
        return this.searchSettings.meshTree && this.searchSettings.meshTree.length > 0;
    }

    hideShowFilter() {
        this.filterMode = !this.filterMode;
    }

    initSearch() {
        this.searchSettings = new SearchSettings;
    }

    isSearched() {
        return this.searchSettings.q || this.searchSettings.selectedOrg || this.searchSettings.meshTree;
    }

    keys(obj: Object) {
        return Object.keys(obj);
    }

    openOrgDetails(org: Organization) {
        this.orgHtmlOverview = org.htmlOverview;
        this.modalService.open(this.orgDetailsModal, {size: 'lg'});
    }

    openPinModal() {
        this.pinAll(this.pinModalComponent.instance.open());
    }

    openValidRulesModal() {
        this.validRulesStatus = 'Incomplete';
        this.modalService.open(this.validRulesModal).result.then((report) => {
            report.searchSettings = this.searchSettings;
            delete report.searchSettings.resultPerPage;
            // let params = new URLSearchParams;
            // params.set('searchSettings', JSON.stringify(report.searchSettings));
            // params.set('status', report.status);
            // let uri = params.toString();
            this.router.navigate(['/cdeStatusReport'], {
                queryParams: {
                    searchSettings: JSON.stringify(report.searchSettings),
                    status: report.status
                }
            });
        }, () => {
        });
    }

    goToPage = 1;

    pageChange(newPage) {
        this.goToPage = newPage.pageIndex + 1;
        if (this.goToPage !== 0) {
            if (this.goToPage < 1 || this.goToPage > this.numPages) {
                this.alert.addAlert('danger', 'Invalid page: ' + this.goToPage);
            } else {
                this.searchSettings.page = this.goToPage;
                this.doSearch();
            }
        }
    }

    pinAll(promise: Promise<any>) {
        promise.then(selectedBoard => {
            let filter = {
                reset: function () {
                    this.tags = [];
                    this.sortBy = 'updatedDate';
                    this.sortDirection = 'desc';
                },
                sortBy: '',
                sortDirection: '',
                tags: []
            };
            let data = {
                query: this.elasticService.buildElasticQuerySettings(this.searchSettings),
                boardId: selectedBoard._id,
                itemType: this.module
            };
            data.query.resultPerPage = (<any>window).maxPin;
            this.http.post('/server/board/pinEntireSearchToBoard', data, {responseType: 'text'}).subscribe(() => {
                this.alert.addAlert('success', 'All elements pinned.');
                this.http.post('/server/board/myBoards', filter).subscribe();
            }, () => this.alert.addAlert('danger', 'Not all elements were not pinned!'));
        }, () => {
        });
    }

    redirect(params: string[]) {
        this.router.navigate(['/' + this.module + '/search'], {queryParams: params});
    }

    reload() {
        let timestamp = new Date().getTime();
        this.lastQueryTimeStamp = timestamp;
        if (this.searchSettingsInput) Object.assign(this.searchSettings, this.searchSettingsInput);
        let settings = this.elasticService.buildElasticQuerySettings(this.searchSettings);
        this.elasticService.generalSearchQuery(settings, this.module, (err: string, result: ElasticQueryResponse, corrected: boolean) => {
            this.searchedTerm = this.searchSettings.q;
            if (corrected && this.searchedTerm) {
                this.searchedTerm = this.searchedTerm.replace(/[^\w\s]/gi, '');
            }
            if (err) {
                this.alert.addAlert('danger', 'There was a problem with your query');
                this.elts = [];
                return;
            }
            if (timestamp < this.lastQueryTimeStamp!) return;
            this.numPages = Math.ceil(result.totalNumber / this.resultPerPage);
            this.took = result.took;
            this.totalItems = result.totalNumber;
            this.totalItemsLimited = this.totalItems <= 10000 ? this.totalItems : 10000;

            this.elts = result[this.module + 's'];

            if (this.searchSettings.page === 1 && result.totalNumber > 0) {
                let maxJump = 0;
                let maxJumpIndex = 100;
                this.elts!.map((e, i) => {
                    if (!this.elts![i + 1]) return;
                    let jump = e.score - this.elts![i + 1].score;
                    if (jump > maxJump) {
                        maxJump = jump;
                        maxJumpIndex = i + 1;
                    }
                });

                if (maxJump > (result.maxScore / 4)) this.cutoffIndex = maxJumpIndex;
                else this.cutoffIndex = 100;
            } else {
                this.cutoffIndex = 100;
            }

            this.orgHelperService.then(() => {
                this.elts!.forEach(elt => {
                    elt.usedBy = this.orgHelperService.getUsedBy(elt);
                });
            }, _noop);

            this.aggregations = result.aggregations;

            if (result.aggregations !== undefined) {
                if (result.aggregations.flatClassifications !== undefined) {
                    this.aggregations.flatClassifications = result.aggregations.flatClassifications.flatClassifications.buckets.map((c: ElasticQueryResponseAggregationBucket) => {
                        return {name: c.key.split(';').pop(), count: c.doc_count};
                    });
                } else {
                    this.aggregations.flatClassifications = [];
                }

                if (result.aggregations.flatClassificationsAlt !== undefined) {
                    this.aggregations.flatClassificationsAlt = result.aggregations.flatClassificationsAlt.flatClassificationsAlt.buckets.map((c: ElasticQueryResponseAggregationBucket) => {
                        return {name: c.key.split(';').pop(), count: c.doc_count};
                    });
                } else {
                    this.aggregations.flatClassificationsAlt = [];
                }

                if (result.aggregations.meshTrees !== undefined) {
                    if (this.searchSettings.meshTree) {
                        this.aggregations.topics = result.aggregations.meshTrees.meshTrees.buckets.map((c: ElasticQueryResponseAggregationBucket) => {
                            return {name: c.key.split(';').pop(), count: c.doc_count};
                        });
                    } else {
                        this.aggregations.topics = result.aggregations.meshTrees.meshTrees.buckets.map((c: ElasticQueryResponseAggregationBucket) => {
                            return {name: c.key.split(';')[0], count: c.doc_count};
                        });
                    }
                } else {
                    this.aggregations.topics = [];
                }

            }

            let orgsCreatedPromise = new Promise(resolve => {
                this.filterOutWorkingGroups(() => {
                    this.orgHelperService.then(() => {
                        this.orgHelperService.addLongNameToOrgs(this.aggregations.orgs.buckets);
                    }, _noop);
                    this.aggregations.orgs.buckets.sort((a: ElasticQueryResponseAggregationBucket, b: ElasticQueryResponseAggregationBucket) => {
                        let A = a.key.toLowerCase();
                        let B = b.key.toLowerCase();
                        if (B > A) return -1;
                        if (A === B) return 0;
                        return 1;
                    });
                    resolve();
                });
            });

            this.aggregations.flatClassifications.sort(SearchBaseComponent.compareObjName);
            this.aggregations.flatClassificationsAlt.sort(SearchBaseComponent.compareObjName);
            this.aggregations.statuses.statuses.buckets.sort(function (a: ElasticQueryResponseAggregationBucket, b: ElasticQueryResponseAggregationBucket) {
                return SearchBaseComponent.getRegStatusIndex(a) - SearchBaseComponent.getRegStatusIndex(b);
            });
            this.aggregations.topics.sort(SearchBaseComponent.compareObjName);

            this.switchView(this.isSearched() ? 'results' : 'welcome');
            if (this.view === 'welcome') {
                this.orgs = [];

                if (this.aggregations) {
                    orgsCreatedPromise.then(() => {
                        this.orgHelperService.then(orgsDetailedInfo => {
                            this.aggregations.orgs.buckets.forEach((org_t: ElasticQueryResponseAggregationBucket) => {
                                if (orgsDetailedInfo[org_t.key]) {
                                    this.orgs!.push({
                                        name: org_t.key,
                                        longName: orgsDetailedInfo[org_t.key].longName,
                                        count: org_t.doc_count,
                                        uri: orgsDetailedInfo[org_t.key].uri,
                                        extraInfo: orgsDetailedInfo[org_t.key].extraInfo,
                                        htmlOverview: orgsDetailedInfo[org_t.key].htmlOverview
                                    });
                                }
                            });
                            this.orgs!.sort(SearchBaseComponent.compareObjName);
                        }, _noop);
                    });
                }

                this.topics = {};
                this.topicsKeys.length = 0;
                if (this.aggregations) {
                    this.aggregations.twoLevelMesh.twoLevelMesh.buckets.forEach((term: ElasticQueryResponseAggregationBucket) => {
                        let spli = term.key.split(';');
                        if (!this.topics[spli[0]]) {
                            this.topics[spli[0]] = [];
                        }
                        this.topics[spli[0]].push({name: spli[1], count: term.doc_count});
                    });
                    for (let prop in this.topics) {
                        if (this.topics.hasOwnProperty(prop)) this.topicsKeys.push(prop);
                    }
                    this.topicsKeys.sort(SearchBaseComponent.compareObjName);
                }
            }
            this.scrollHistoryLoad();
        });
    }

    reset() {
        this.initSearch();
        this.aggregations = null;
        this.doSearch();
    }

    scrollHistoryLoad() {
        if (this.backForwardService.isBackForward || this.router.navigationId === 1) {
            let previousSpot = window.sessionStorage['nlmcde.scroll.' + location.pathname + location.search];
            if (previousSpot != null) SearchBaseComponent.waitScroll(2, previousSpot);
        }
        this.previousUrl = location.pathname + location.search;
    }

    scrollHistorySave() {
        if (!this.backForwardService.isBackForward) window.sessionStorage['nlmcde.scroll.' + this.previousUrl] = window.scrollY;
    }

    search() {
        // TODO: replace with router
        let params = SearchBaseComponent.searchParamsGet();
        if (params['q']) this.searchSettings.q = params['q'];
        else this.searchSettings.q = '';
        this.searchSettings.page = parseInt(params['page']);
        if (!this.searchSettings.page) this.searchSettings.page = 1;
        this.searchSettings.selectedOrg = params['selectedOrg'];
        this.searchSettings.selectedOrgAlt = params['selectedOrgAlt'];
        this.altClassificationFilterMode = !!params['selectedOrgAlt'];
        this.searchSettings.classification = params['classification'] ? params['classification'].split(';') : [];
        this.searchSettings.classificationAlt = params['classificationAlt'] ? params['classificationAlt'].split(';') : [];
        this.searchSettings.regStatuses = params['regStatuses'] ? params['regStatuses'].split(';') as CurationStatus[] : [];
        this.searchSettings.datatypes = params['datatypes'] ? params['datatypes'].split(';') as DataType[] : [];
        this.searchSettings.meshTree = params['topic'];
        this.byTopic = params.hasOwnProperty('byTopic');
        this.reload();
    }

    static searchParamsGet(): {[param: string]: string} {
        let params: any = {};
        location.search && location.search.substr(1).split('&').forEach(e => {
            let p = e.split('=');
            if (p.length === 2) params[p[0]] = decodeURIComponent(p[1]);
            else params[p[0]] = null;
        });
        return params;
    }

    selectElement(e: string) {
        let classifToSelect = this.getCurrentSelectedClassification();
        if (!classifToSelect) classifToSelect = [];
        if (classifToSelect.length === 0) {
            classifToSelect.length = 0;
            classifToSelect.push(e);
        } else {
            let i = classifToSelect.indexOf(e);
            if (i > -1) classifToSelect.length = i + 1;
            else classifToSelect.push(e);
        }

        this.doSearch();
        if (!this.embedded) SearchBaseComponent.focusClassification();
    }

    selectTopic(topic: string) {
        let toSelect = !this.searchSettings.meshTree ? [] : this.searchSettings.meshTree.split(';');
        let i = toSelect.indexOf(topic);
        if (i > -1) toSelect.length = i + 1;
        else toSelect.push(topic);
        this.searchSettings.meshTree = toSelect.join(';');

        this.doSearch();
        if (!this.embedded) SearchBaseComponent.focusTopic();
    }

    setAltClassificationFilterMode() {
        this.altClassificationFilterMode = true;
        this.doSearch();
        if (!this.embedded) SearchBaseComponent.focusClassification();
    }

    switchView(view: 'welcome'|'results') {
        if (this.view === view || view !== 'welcome' && view !== 'results') return;

        this.view = view;
        if (this.view === 'welcome') {
            // ngAfterViewChecked
            setTimeout(() => {
                if (this.byTopic) this.tabset.select('browseByTopic');
            }, 100);
        }
        if (this.view === 'results') {
            // ngAfterViewInit
            setTimeout(() => {
                let pinFactory = this._componentFactoryResolver.resolveComponentFactory(this.pinComponent);
                let intPin = setInterval(() => {
                    if (this.pinContainer) {
                        this.pinContainer.clear();
                        this.pinModalComponent = this.pinContainer.createComponent(pinFactory);
                        clearInterval(intPin);
                    }
                }, 0);
            }, 0);
        }
    }

    termSearch() {
        this.searchSettings.page = 1;
        this.searchSettings.regStatuses.length = 0;
        this.searchSettings.datatypes.length = 0;
        this.searchSettings.classification.length = 0;
        this.searchSettings.classificationAlt.length = 0;
        this.searchSettings.selectedOrgAlt = undefined;
        this.altClassificationFilterMode = false;

        if (this.searchSettings.meshTree) {
            let index = this.searchSettings.meshTree.indexOf(';');
            if (index > -1) index = this.searchSettings.meshTree.indexOf(';', index + 1);
            if (index > -1) this.searchSettings.meshTree = this.searchSettings.meshTree.substr(0, index);
        }

        this.doSearch();
        setTimeout(() => {
            if (this.autoCompleteInput) this.autoCompleteInput.closePanel();
        }, 0);
    }

    typeaheadSelect(item) {
        if (!this.embedded) {
            this.router.navigate([this.module === 'form' ? 'formView' : 'deView'],
                {queryParams: {tinyId: this.lastTypeahead[item.option.value]}});
        }
        else this.reload();
    }

    static waitScroll(count: number, previousSpot: number) {
        if (count > 0) setTimeout(() => SearchBaseComponent.waitScroll(count - 1, previousSpot), 100);
        else window.scrollTo(0, previousSpot);
    }
}
