import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Event, NavigationStart, Params, Router } from '@angular/router';
import { BackForwardService } from '_app/backForward.service';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { paramsToQueryString, trackByKey, trackByName } from 'non-core/angularHelper';
import { scrollTo } from 'non-core/browser';
import { ExportService } from 'non-core/export.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Subscription } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { addOrRemoveFromArray, removeFromArray } from 'shared/array';
import { DataType } from 'shared/de/dataElement.model';
import { uriViewBase } from 'shared/item';
import {
    assertUnreachable,
    Cb1,
    CopyrightStatus,
    CurationStatus,
    ElasticQueryResponseAggregation,
    ElasticQueryResponseAggregationBucket,
    ElasticQueryResponseHit,
    ItemElastic,
    ModuleItem,
    SearchResponseAggregationDe,
    SearchResponseAggregationForm,
    SearchResponseAggregationItem,
} from 'shared/models.model';
import { Organization } from 'shared/organization/organization';
import { SearchSettings } from 'shared/search/search.model';
import { isSiteAdmin } from 'shared/security/authorizationShared';
import { orderedList, statusList } from 'shared/regStatusShared';
import { copyrightStatusList } from 'shared/copyrightStatusShared';
import { noop, ownKeys, stringToArray } from 'shared/util';
import { OrgDetailModalComponent } from 'org-detail-modal/org-detail-modal.component';

type ItemSuggest = any;
type NamedCounts = { name: string; count: number }[];
type SearchType = 'cde' | 'endorsedCde' | 'form';

const searchDesktopWidth = 772;

@Component({
    template: '',
})
export abstract class SearchBaseComponent implements OnDestroy, OnInit {
    @Input() addMode?: string;
    @Input() embedded: boolean = false;
    @Input() searchSettingsInput?: SearchSettings;
    @ViewChild('autoCompleteInput', {
        read: MatAutocompleteTrigger,
        static: true,
    })
    autoCompleteInput!: MatAutocompleteTrigger;
    @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
    _searchType: SearchType = 'cde';
    add!: EventEmitter<any>;
    aggregations?: ElasticQueryResponseAggregation;
    aggregationsFlatClassifications?: NamedCounts;
    aggregationsFlatClassificationsAlt?: NamedCounts;
    aggregationsExcludeClassification?: NamedCounts;
    aggregationsTopics?: NamedCounts;
    altClassificationFilterMode?: boolean;
    excludeOrgFilterMode?: boolean;
    autocompleteSuggestions?: string[];
    cutoffIndex?: number;
    elts?: ItemElastic[];
    exporters: {
        [format in 'csv' | 'json' | 'odm' | 'validationRules' | 'xml']?: {
            id: string;
            display: string;
        };
    } = {
        json: { id: 'jsonExport', display: 'JSON file' },
        xml: { id: 'xmlExport', display: 'XML archive' },
    };
    filterMode = true;
    goToPage = 1;
    isSearchDesktop: boolean = window.innerWidth >= searchDesktopWidth;
    lastQueryTimeStamp?: number;
    private lastTypeahead: { [term: string]: string } = {};
    module!: ModuleItem;
    numPages?: number;
    orgs?: (Organization & { featureIcon?: string })[] = [];
    ownKeys = ownKeys;
    previousUrl?: string;
    resultsView: 'summary' | 'table' = 'summary';
    routerSubscription: Subscription;
    searching = false;
    searchSettings: SearchSettings = new SearchSettings();
    searchedTerm?: string;
    searchTerm: string = '';
    searchTermAutoComplete = new EventEmitter<string>();
    showLoadingScreen: boolean = false;
    startingFromWelcomeScreen: boolean = false;
    took?: number;
    topics?: { [topic: string]: NamedCounts };
    topicsKeys: string[] = [];
    totalItems?: number;
    totalItemsLimited?: number;
    trackByKey = trackByKey;
    trackByName = trackByName;

    protected constructor(
        protected alert: AlertService,
        protected backForwardService: BackForwardService,
        protected elasticService: ElasticService,
        protected exportService: ExportService,
        protected http: HttpClient,
        protected orgHelperService: OrgHelperService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected userService: UserService,
        protected dialog: MatDialog
    ) {
        this.filterMode = window.innerWidth >= 768;
        this.searchSettings.page = 1;
        this.routerSubscription = this.router.events.subscribe((e: Event) => {
            if (this.previousUrl && e instanceof NavigationStart) {
                if (/^\/(cde|form)\/search/.exec(this.previousUrl)) {
                    this.scrollHistorySave();
                }
                this.previousUrl = '';
            }
        });
        this.searchTermAutoComplete.pipe(debounceTime(500)).subscribe(term => {
            if (term && term.length >= 3) {
                let url = '/server/de/completion/';
                if (this.module === 'form') {
                    url = '/server/form/completion/';
                }
                this.http
                    .post<ElasticQueryResponseHit<ItemSuggest>[]>(
                        url + encodeURIComponent(term),
                        this.elasticService.buildElasticQuerySettings(this.searchSettings)
                    )
                    .pipe(
                        map(hits => {
                            const final = new Set<string>();
                            this.lastTypeahead = {};
                            hits.forEach(e => {
                                this.lastTypeahead[e._source.nameSuggest] = e._id;
                                final.add(e._source.nameSuggest);
                            });
                            return Array.from(final);
                        })
                    )
                    .subscribe(res => (this.autocompleteSuggestions = res));
            }
        });
    }

    @HostListener('window:beforeunload') unload() {
        if (/^\/(cde|form)\/search$/.exec(location.pathname)) {
            window.sessionStorage['nlmcde.scroll.' + location.pathname + location.search] = window.scrollY;
        }
    }

    ngOnDestroy() {
        if (this.routerSubscription) {
            this.routerSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params: Params) => {
            this.autocompleteSuggestions = undefined;
            this.searchSettings.classification = Array.isArray(params.classification)
                ? params.classification
                : stringToArray(params.classification);
            this.searchSettings.classificationAlt = stringToArray(params.classificationAlt);
            this.searchSettings.datatypes = stringToArray(params.datatypes);
            this.searchSettings.excludeOrgs = stringToArray(params.excludeOrgs);
            this.searchSettings.excludeAllOrgs = !!params.excludeAllOrgs;
            this.searchSettings.meshTree = params.topic;
            this.searchSettings.page = parseInt(params.page, 10) || 1;
            this.searchSettings.q = this.searchTerm = params.q;
            this.searchSettings.copyrightStatus = stringToArray(params.copyrightStatus);
            this.searchSettings.regStatuses = stringToArray(params.regStatuses);
            this.searchSettings.selectedOrg = params.selectedOrg;
            this.searchSettings.selectedOrgAlt = params.selectedOrgAlt;
            this.altClassificationFilterMode = !!params.selectedOrgAlt;
            this.excludeOrgFilterMode = !!params.excludeAllOrgs || !!params.excludeOrgs;
            this.searchSettings.nihEndorsed = !!params.nihEndorsed;
            if (this.searchSettings.nihEndorsed) {
                this._searchType = 'endorsedCde';
            }
            this.reload();
        });
    }

    addNihEndorsedFilter(nihEndorsed: boolean) {
        this.searchSettings.nihEndorsed = nihEndorsed;
        this._searchType = nihEndorsed ? 'endorsedCde' : 'cde';
        this.doSearch();
    }

    addDatatypeFilter(datatype: DataType) {
        if (!this.searchSettings.datatypes) {
            this.searchSettings.datatypes = [];
        }
        addOrRemoveFromArray(this.searchSettings.datatypes, datatype);
        this.doSearch();
    }

    addStatusFilter(status: CurationStatus) {
        if (!this.searchSettings.regStatuses) {
            this.searchSettings.regStatuses = [];
        }
        addOrRemoveFromArray(this.searchSettings.regStatuses, status);
        this.doSearch();
    }

    addCopyrightStatusFilter(status: string) {
        if (!this.searchSettings.copyrightStatus) {
            this.searchSettings.copyrightStatus = [];
        }
        addOrRemoveFromArray(this.searchSettings.copyrightStatus, status);
        this.doSearch();
    }

    alterOrgFilter(orgName: string) {
        const orgToAlter = this.getCurrentSelectedOrg();

        if (orgToAlter === undefined) {
            if (this.altClassificationFilterMode) {
                this.searchSettings.selectedOrgAlt = orgName;
            } else if (this.excludeOrgFilterMode) {
                this.searchSettings.excludeOrgs.push(orgName);
            } else {
                this.searchSettings.selectedOrg = orgName;
            }
        } else {
            if (this.altClassificationFilterMode) {
                this.searchSettings.classificationAlt.length = 0;
            } else if (this.excludeOrgFilterMode) {
                this.searchSettings.excludeOrgs.push(orgName);
            } else {
                this.searchSettings.classification.length = 0;
            }
        }
        if (this.aggregations) {
            delete this.aggregations.groups;
        }
        if (this.isSearched()) {
            this.doSearch();
            if (!this.embedded) {
                SearchBaseComponent.focusClassification();
            }
        } else {
            this.reset();
        }
    }

    browseOrg(orgName: string) {
        window.scrollTo(0, 0);

        this.searchSettings.selectedOrg = orgName;

        this.doSearch();
        if (!this.embedded) {
            scrollTo('top');
        }
    }

    browseTopic(topic: string) {
        this.searchSettings.meshTree = topic;

        this.doSearch();
        if (!this.embedded) {
            scrollTo('top');
        }
    }

    clearSelectedClassifications(c: string) {
        if (c === this.searchSettings.selectedOrg) {
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
        } else {
            const index = this.searchSettings.classification.indexOf(c);
            if (index > -1) {
                this.searchSettings.classification.length = index;
            }
            this.doSearch();
        }
    }

    clearSelectedClassificationsAlt(c?: string) {
        if (!c || c === this.searchSettings.selectedOrgAlt) {
            this.altClassificationFilterMode = false;
            this.searchSettings.selectedOrgAlt = undefined;
            this.searchSettings.classificationAlt.length = 0;
        } else {
            const index = this.searchSettings.classificationAlt.indexOf(c);
            if (index > -1) {
                this.searchSettings.classificationAlt.length = index;
            }
        }

        this.doSearch();
    }

    clearExcludeOrgs() {
        this.excludeOrgFilterMode = false;
        this.searchSettings.excludeAllOrgs = false;
        this.searchSettings.excludeOrgs = [];
        this.doSearch();
    }

    clearSelectedDatatype(datatype: DataType) {
        if (this.searchSettings.datatypes && removeFromArray(this.searchSettings.datatypes, datatype)) {
            this.doSearch();
        }
    }

    clearSelectedCopyrightStatus(status: CopyrightStatus) {
        if (this.searchSettings.copyrightStatus && removeFromArray(this.searchSettings.copyrightStatus, status)) {
            this.doSearch();
        }
    }

    clearSelectedStatus(status: CurationStatus) {
        if (this.searchSettings.regStatuses && removeFromArray(this.searchSettings.regStatuses, status)) {
            this.doSearch();
        }
    }

    clearSelectedTopics() {
        this.searchSettings.meshTree = '';
        this.doSearch();
    }

    doSearch() {
        if (this.embedded) {
            this.reload();
        } else {
            this.searchSettings.page = 1;
            this.redirect(this.generateSearchForTerm());
        }
    }

    doSearchWithPage() {
        if (this.embedded) {
            this.reload();
        } else {
            this.redirect(this.generateSearchForTerm());
        }
    }

    fakeNextPageLink(): string {
        const p =
            (this.totalItemsLimited || 0) / this.searchSettings.resultPerPage > 1
                ? (this.searchSettings.page ? this.searchSettings.page : 1) + 1
                : 1;
        return paramsToQueryString(this.generateSearchForTerm(p));
    }

    private filterOutWorkingGroups(cb: Cb1<string | void>) {
        this.userService
            .waitForUser()
            .catch(noop)
            .then(user => {
                this.orgHelperService.then(() => {
                    if (this.aggregations) {
                        (this.aggregations.orgs.buckets as any) = this.aggregations.orgs.orgs.buckets.filter(
                            (bucket: ElasticQueryResponseAggregationBucket) =>
                                this.orgHelperService.showWorkingGroup(bucket.key) || (!!user && isSiteAdmin(user))
                        );
                    }
                    cb();
                }, cb);
            });
    }

    generateSearchForTerm(pageNumber = 0): Params {
        const searchTerms: Params = {};
        if (this.searchSettings.q) {
            searchTerms.q = this.searchSettings.q;
        }
        if (this.searchSettings.copyrightStatus && this.searchSettings.copyrightStatus.length > 0) {
            searchTerms.copyrightStatus = this.searchSettings.copyrightStatus.join(';');
        }
        if (this.searchSettings.regStatuses && this.searchSettings.regStatuses.length > 0) {
            searchTerms.regStatuses = this.searchSettings.regStatuses.join(';');
        }
        if (this.searchSettings.datatypes && this.searchSettings.datatypes.length > 0) {
            searchTerms.datatypes = this.searchSettings.datatypes.join(';');
        }
        if (this.searchSettings.selectedOrg) {
            searchTerms.selectedOrg = this.searchSettings.selectedOrg;
        }
        if (this.searchSettings.classification.length > 0) {
            searchTerms.classification = this.searchSettings.classification.join(';');
        }
        if (this.searchSettings.selectedOrgAlt) {
            searchTerms.selectedOrgAlt = this.searchSettings.selectedOrgAlt;
        }
        if (this.altClassificationFilterMode && this.searchSettings.classificationAlt.length > 0) {
            searchTerms.classificationAlt = this.searchSettings.classificationAlt.join(';');
        }
        if (this.searchSettings.excludeAllOrgs) {
            searchTerms.excludeAllOrgs = true;
        }
        if (this.searchSettings.excludeOrgs && this.searchSettings.excludeOrgs.length > 0) {
            searchTerms.excludeOrgs = this.searchSettings.excludeOrgs.join(';');
        }
        if (pageNumber > 1) {
            searchTerms.page = pageNumber;
        } else if (this.searchSettings.page && this.searchSettings.page > 1) {
            searchTerms.page = this.searchSettings.page;
        }
        if (this.searchSettings.nihEndorsed) {
            searchTerms.nihEndorsed = this.searchSettings.nihEndorsed;
        }
        if (this.searchSettings.meshTree) {
            searchTerms.topic = this.searchSettings.meshTree;
        }
        return searchTerms;
    }

    getCurrentSelectedClassification(): string[] {
        return this.altClassificationFilterMode
            ? this.searchSettings.classificationAlt
            : this.searchSettings.classification;
    }

    getCurrentSelectedOrg() {
        if (this.altClassificationFilterMode) {
            return this.searchSettings.selectedOrgAlt;
        } else if (this.excludeOrgFilterMode) {
            return this.searchSettings.selectedOrgAlt;
        } else {
            return this.searchSettings.selectedOrg;
        }
    }

    getCurrentSelectedTopic() {
        return this.searchSettings.meshTree ? this.searchSettings.meshTree.split(';') : [];
    }

    getRegStatusHelp(name: string) {
        let result = '';
        statusList.forEach(s => {
            if (s.name === name) {
                result = s.help;
            }
        });
        return result;
    }

    getCopyrightStatusHelp(name: string) {
        let result = '';
        copyrightStatusList.forEach(s => {
            if (s.name === name) {
                result = s.help;
            }
        });
        return result;
    }

    getSearchLabel(searchType: SearchType): string {
        switch (searchType) {
            case 'endorsedCde':
                return 'NIH-Endorsed CDEs';
            case 'cde':
                return 'All CDEs';
            case 'form':
                return 'Forms';
            default:
                assertUnreachable(searchType);
        }
    }

    // Create string representation of what filters are selected. Use the hasSelected...() first.
    getSelectedClassifications(): string[] {
        if (!this.searchSettings.selectedOrg) {
            return [];
        }
        return [this.searchSettings.selectedOrg].concat(
            Array.isArray(this.searchSettings.classification) ? this.searchSettings.classification : []
        );
    }

    getSelectedClassificationsAlt(): string[] {
        if (!this.searchSettings.selectedOrgAlt) {
            return ['(Select Orgs)'];
        }
        return [this.searchSettings.selectedOrgAlt].concat(
            Array.isArray(this.searchSettings.classificationAlt) ? this.searchSettings.classificationAlt : []
        );
    }

    getExcludedOrgs(): string {
        if (this.searchSettings.excludeAllOrgs) {
            return 'Exclude all Orgs (except ' + this.searchSettings.selectedOrg + ')';
        } else if (this.searchSettings.excludeOrgs.length > 0) {
            return this.searchSettings.excludeOrgs.join(' , ');
        } else {
            return '(Select Orgs)';
        }
    }

    @HostListener('window:resize', [])
    onResize() {
        this.isSearchDesktop = window.innerWidth >= searchDesktopWidth;
    }

    searchExcludeAllOrgs() {
        this.searchSettings.excludeAllOrgs = true;
        this.doSearch();
    }

    getClassificationSelectedOrg() {
        if (this.altClassificationFilterMode) {
            return this.aggregationsFlatClassificationsAlt;
        } else if (this.excludeOrgFilterMode) {
            return this.aggregationsExcludeClassification;
        } else {
            return this.aggregationsFlatClassifications;
        }
    }

    getSelectedTopics() {
        const res = this.searchSettings.meshTree.split(';').join(' > ');
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
        return (
            this.searchSettings.regStatuses &&
            this.searchSettings.regStatuses.length > 0 &&
            this.searchSettings.regStatuses.length !== 6
        );
    }

    hasSelectedCopyrightStatuses() {
        return this.searchSettings.copyrightStatus && this.searchSettings.copyrightStatus.length > 0;
    }

    hasSelectedTopics() {
        return this.searchSettings.meshTree && this.searchSettings.meshTree.length > 0;
    }

    hideShowFilter() {
        this.filterMode = !this.filterMode;
    }

    isFullScreen() {
        return this.resultsView === 'table' && this.isSearched();
    }

    isSearched(): boolean {
        return !!(
            this.searchSettings.q ||
            this.searchSettings.nihEndorsed ||
            this.hasSelectedClassifications() ||
            this.hasSelectedDatatypes() ||
            this.hasSelectedStatuses() ||
            this.hasSelectedCopyrightStatuses() ||
            this.searchSettings.meshTree
        );
    }

    openOrgDetails(org: Organization) {
        const data = org.htmlOverview;
        this.dialog.open(OrgDetailModalComponent, { width: '600px', data });
    }

    pageChange(newPage: PageEvent) {
        this.goToPage = newPage.pageIndex + 1;
        if (this.goToPage !== 0) {
            if (this.goToPage < 1 || this.goToPage > (this.numPages || 0)) {
                this.alert.addAlert('danger', 'Invalid page: ' + this.goToPage);
            } else {
                this.searchSettings.page = this.goToPage;
                this.doSearchWithPage();
            }
        }
    }

    redirect(params: Params) {
        this.router.navigate(['/' + this.module + '/search'], {
            queryParams: params,
        });
    }

    reload() {
        const timestamp = new Date().getTime();
        this.lastQueryTimeStamp = timestamp;
        const lastQueryTimeStamp = this.lastQueryTimeStamp;
        this.searching = true;
        const isSearched = this.isSearched();
        this.showLoadingScreen = this.startingFromWelcomeScreen && isSearched;
        this.startingFromWelcomeScreen = !isSearched;
        if (this.searchSettingsInput) {
            Object.assign(this.searchSettings, this.searchSettingsInput);
        }
        const settings = this.elasticService.buildElasticQuerySettings(this.searchSettings);
        this.elasticService.generalSearchQuery(
            settings,
            this.module,
            (err?: string, resultNonAgg?: any, corrected?: boolean) => {
                const result: SearchResponseAggregationItem = resultNonAgg;
                this.searchedTerm = this.searchSettings.q;
                if (corrected && this.searchedTerm) {
                    this.searchedTerm = this.searchedTerm.replace(/[^\w\s]/gi, '');
                }
                if (err || !result || !result.aggregations) {
                    this.alert.addAlert('danger', 'There was a problem with your query');
                    this.elts = [];
                    this.searching = false;
                    return;
                }
                if (timestamp < lastQueryTimeStamp) {
                    this.searching = false;
                    return;
                }
                this.numPages = Math.ceil(result.totalNumber / this.searchSettings.resultPerPage);
                this.took = result.took;
                this.totalItems = result.totalNumber;
                this.totalItemsLimited = this.totalItems <= 10000 ? this.totalItems : 10000;

                this.elts =
                    this.module === 'form'
                        ? (result as SearchResponseAggregationForm).forms
                        : (result as SearchResponseAggregationDe).cdes;
                const elts = this.elts;

                if (this.searchSettings.page === 1 && result.totalNumber > 0) {
                    let maxJump = 0;
                    let maxJumpIndex = 100;
                    this.elts.map((e, i) => {
                        if (!elts[i + 1]) {
                            return;
                        }
                        const jump = e.score - elts[i + 1].score;
                        if (jump > maxJump) {
                            maxJump = jump;
                            maxJumpIndex = i + 1;
                        }
                    });

                    if (maxJump > result.maxScore / 4) {
                        this.cutoffIndex = maxJumpIndex;
                    } else {
                        this.cutoffIndex = 100;
                    }
                } else {
                    this.cutoffIndex = 100;
                }

                this.orgHelperService.then(() => {
                    elts.forEach(elt => {
                        elt.usedBy = this.orgHelperService.getUsedBy(elt);
                    });
                }, noop);

                this.aggregations = result.aggregations;

                this.aggregationsFlatClassifications = this.aggregations.flatClassifications
                    ? this.aggregations.flatClassifications.flatClassifications.buckets.map(
                          (c: ElasticQueryResponseAggregationBucket) => ({
                              name: c.key.split(';').pop() || '',
                              count: c.doc_count,
                          })
                      )
                    : [];

                if (this.aggregations.flatClassificationsAlt !== undefined) {
                    this.aggregationsFlatClassificationsAlt =
                        this.aggregations.flatClassificationsAlt.flatClassificationsAlt.buckets.map(
                            (c: ElasticQueryResponseAggregationBucket) => ({
                                name: c.key.split(';').pop() || '',
                                count: c.doc_count,
                            })
                        );
                } else {
                    this.aggregationsFlatClassificationsAlt = [];
                    this.aggregationsExcludeClassification = [];
                }

                if (this.aggregations.meshTrees !== undefined) {
                    if (this.searchSettings.meshTree) {
                        this.aggregationsTopics = this.aggregations.meshTrees.meshTrees.buckets.map(
                            (c: ElasticQueryResponseAggregationBucket) => ({
                                name: c.key.split(';').pop() || '',
                                count: c.doc_count,
                            })
                        );
                    } else {
                        this.aggregationsTopics = this.aggregations.meshTrees.meshTrees.buckets.map(
                            (c: ElasticQueryResponseAggregationBucket) => ({
                                name: c.key.split(';')[0],
                                count: c.doc_count,
                            })
                        );
                    }
                } else {
                    this.aggregationsTopics = [];
                }

                const aggregations = this.aggregations;
                const orgsCreatedPromise = new Promise<void>(resolve => {
                    this.filterOutWorkingGroups(() => {
                        this.orgHelperService.then(() => {
                            this.orgHelperService.addLongNameToOrgs(aggregations.orgs.buckets);
                        }, noop);
                        resolve();
                    });
                });

                this.aggregationsFlatClassifications.sort(SearchBaseComponent.compareObjName);
                this.aggregationsFlatClassificationsAlt.sort(SearchBaseComponent.compareObjName);
                this.aggregations.statuses.statuses.buckets.sort(
                    (a: ElasticQueryResponseAggregationBucket, b: ElasticQueryResponseAggregationBucket) =>
                        SearchBaseComponent.getRegStatusIndex(a) - SearchBaseComponent.getRegStatusIndex(b)
                );
                this.aggregationsTopics.sort(SearchBaseComponent.compareObjName);

                if (!this.isSearched()) {
                    this.orgs = [];
                    const orgs = this.orgs;

                    orgsCreatedPromise.then(() => {
                        this.orgHelperService.then(orgsDetailedInfo => {
                            this.orgHelperService.sortOrganizationsEndorsedFirst(aggregations.orgs.buckets);
                            aggregations.orgs.buckets.forEach((orgBucket: ElasticQueryResponseAggregationBucket) => {
                                const orgsDetailedInfoMapped = orgsDetailedInfo[orgBucket.key];
                                if (orgsDetailedInfo[orgBucket.key]) {
                                    orgs.push({
                                        endorsed: orgsDetailedInfoMapped.endorsed,
                                        classifications: [],
                                        name: orgBucket.key,
                                        longName: orgsDetailedInfo[orgBucket.key].longName,
                                        count: orgBucket.doc_count,
                                        uri: orgsDetailedInfo[orgBucket.key].uri,
                                        extraInfo: orgsDetailedInfo[orgBucket.key].extraInfo,
                                        htmlOverview: orgsDetailedInfo[orgBucket.key].htmlOverview,
                                        cdeStatusValidationRules: [],
                                    });
                                }
                            });
                        }, noop);
                    });

                    this.topics = {};
                    const topics = this.topics;
                    this.topicsKeys.length = 0;
                    this.aggregations.twoLevelMesh.twoLevelMesh.buckets.forEach(
                        (term: ElasticQueryResponseAggregationBucket) => {
                            const spli: string[] = term.key.split(';');
                            if (!topics[spli[0]]) {
                                topics[spli[0]] = [];
                            }
                            topics[spli[0]].push({ name: spli[1], count: term.doc_count });
                        }
                    );
                    for (const prop in this.topics) {
                        if (this.topics.hasOwnProperty(prop)) {
                            this.topicsKeys.push(prop);
                        }
                    }
                    this.topicsKeys.sort();
                }
                this.scrollHistoryLoad();
                this.searching = false;
            }
        );
    }

    reset() {
        this.searchSettings = new SearchSettings();
        this.doSearch();
    }

    resetFilters() {
        this.searchSettings = new SearchSettings(this.searchSettings.q);
        if (this._searchType === 'endorsedCde') {
            this._searchType = 'cde';
        }
        this.doSearch();
    }

    scrollHistoryLoad() {
        if (this.backForwardService.isBackForward || (this.router as any).navigationId === 1) {
            const previousSpot = window.sessionStorage['nlmcde.scroll.' + location.pathname + location.search];
            if (previousSpot != null) {
                SearchBaseComponent.waitScroll(2, previousSpot);
            }
        }
        this.previousUrl = location.pathname + location.search;
    }

    scrollHistorySave() {
        if (!this.backForwardService.isBackForward) {
            window.sessionStorage['nlmcde.scroll.' + this.previousUrl] = window.scrollY;
        }
    }

    get searchType(): SearchType {
        return this._searchType;
    }

    selectElement(e: string, element: 'parent' | 'child', index: number) {
        let classifToSelect = this.getCurrentSelectedClassification();
        if (!classifToSelect) {
            classifToSelect = [];
        }
        if (classifToSelect.length === 0) {
            classifToSelect.length = 0;
            classifToSelect.push(e);
        } else {
            if (element === 'parent') {
                classifToSelect.length = index + 1;
            } else {
                classifToSelect.push(e);
            }
        }

        this.doSearch();
        if (!this.embedded) {
            SearchBaseComponent.focusClassification();
        }
    }

    selectTopic(topic: string) {
        const toSelect = !this.searchSettings.meshTree ? [] : this.searchSettings.meshTree.split(';');
        const i = toSelect.indexOf(topic);
        if (i > -1) {
            toSelect.length = i + 1;
        } else {
            toSelect.push(topic);
        }
        this.searchSettings.meshTree = toSelect.join(';');

        this.doSearch();
    }

    setAltClassificationFilterMode() {
        this.altClassificationFilterMode = true;
        this.doSearch();
        if (!this.embedded) {
            SearchBaseComponent.focusClassification();
        }
    }

    setExcludeOrgFilterMode() {
        this.excludeOrgFilterMode = true;
        this.doSearch();
        if (!this.embedded) {
            SearchBaseComponent.focusClassification();
        }
    }

    setSearchType(searchType: SearchType) {
        if (this.searchType === searchType) {
            return;
        }
        this._searchType = searchType;
        switch (searchType) {
            case 'cde':
                if (this.module === 'form' || this.searchSettings.nihEndorsed) {
                    this.searchSettings.nihEndorsed = false;
                    this.module = 'cde';
                    this.doSearch();
                }
                return;
            case 'endorsedCde':
                if (this.module === 'form' || !this.searchSettings.nihEndorsed) {
                    this.searchSettings.nihEndorsed = true;
                    this.module = 'cde';
                    this.doSearch();
                }
                return;
            case 'form':
                this.searchSettings.datatypes.length = 0;
                this.searchSettings.nihEndorsed = false;
                if (this.module === 'cde') {
                    this.module = 'form';
                    this.doSearch();
                }
                return;
            default:
                assertUnreachable(searchType);
        }
    }

    termSearch(reset?: boolean) {
        if (!this.searchTerm) {
            return;
        }
        this.searchSettings.q = this.searchTerm;
        if (reset) {
            this.searchSettings.page = 1;
            this.searchSettings.regStatuses.length = 0;
            this.searchSettings.datatypes.length = 0;
            this.searchSettings.classification.length = 0;
            this.searchSettings.classificationAlt.length = 0;
            this.searchSettings.selectedOrgAlt = undefined;
            this.altClassificationFilterMode = false;
            this.excludeOrgFilterMode = false;
        }
        if (this.searchSettings.meshTree) {
            let index = this.searchSettings.meshTree.indexOf(';');
            if (index > -1) {
                index = this.searchSettings.meshTree.indexOf(';', index + 1);
            }
            if (index > -1) {
                this.searchSettings.meshTree = this.searchSettings.meshTree.substr(0, index);
            }
        }
        this.doSearch();
        setTimeout(() => {
            // search results only?
            if (this.autoCompleteInput) {
                this.autoCompleteInput.closePanel();
            }
        }, 0);
    }

    typeaheadSelect(item: MatAutocompleteSelectedEvent) {
        if (this.embedded) {
            this.searchSettings.q = item.option.value;
            this.reload();
        } else {
            this.router.navigate([uriViewBase(this.module)], {
                queryParams: { tinyId: this.lastTypeahead[item.option.value] },
            });
        }
    }

    elasticsearchPinQuery() {
        return this.elasticService.buildElasticQuerySettings(this.searchSettings);
    }

    static compareObjName(a: { name: string }, b: { name: string }): number {
        return SearchBaseComponent.compareString(a.name, b.name);
    }

    static compareString(a: string, b: string): number {
        if (a > b) {
            return 1;
        }
        if (a < b) {
            return -1;
        }
        if (a === b) {
            return 0;
        }
        return NaN;
    }

    static focusClassification() {
        document.getElementById('classificationListHolder')?.focus();
    }

    static getRegStatusIndex(rg: ElasticQueryResponseAggregationBucket) {
        return orderedList.indexOf(rg.key as any);
    }

    static waitScroll(count: number, previousSpot: number) {
        if (count > 0) {
            setTimeout(() => SearchBaseComponent.waitScroll(count - 1, previousSpot), 100);
        } else {
            window.scrollTo(0, previousSpot);
        }
    }
}
