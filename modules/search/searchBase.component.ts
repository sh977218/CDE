import { HttpClient } from '@angular/common/http';
import {
    Component,
    ComponentFactoryResolver, ComponentRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit, TemplateRef,
    Type,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Event, NavigationStart, Params, Router } from '@angular/router';
import { BackForwardService } from '_app/backForward.service';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { PinBoardSnackbarComponent } from 'board/snackbar/pinBoardSnackbar.component';
import { paramsToQueryString, trackByKey, trackByName } from 'non-core/angularHelper';
import { scrollTo } from 'non-core/browser';
import { ExportService } from 'non-core/export.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Subscription } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { addOrRemoveFromArray, partition, removeFromArray } from 'shared/array';
import { MAX_PINS } from 'shared/constants';
import { DataType } from 'shared/de/dataElement.model';
import { uriViewBase } from 'shared/item';
import {
    assertUnreachable,
    Cb1,
    CurationStatus, ElasticQueryResponseAggregation, ElasticQueryResponseAggregationBucket,
    ElasticQueryResponseHit, ItemElastic, ModuleItem,
    SearchResponseAggregationDe, SearchResponseAggregationForm, SearchResponseAggregationItem,
} from 'shared/models.model';
import { Organization } from 'shared/organization/organization';
import { SearchSettings } from 'shared/search/search.model';
import { hasRole, isSiteAdmin } from 'shared/security/authorizationShared';
import { orderedList, statusList } from 'shared/regStatusShared';
import { noop, ownKeys } from 'shared/util';
import { PinToBoardModalComponent } from 'board/pin-to-board/pin-to-board-modal/pin-to-board-modal.component';

type NamedCounts = {name: string, count: number}[];
type SearchType = 'cde' | 'endorsedCde' | 'form';

const searchDesktopWidth = 772;
const orderedFirstOrgNames = Object.freeze(['Project 5 (COVID-19)']);
const orderedFirstOrgIcons = Object.freeze(['/assets/img/endorsedRibbonIcon.png']);

@Component({
    template: ''
})
export abstract class SearchBaseComponent implements OnDestroy, OnInit {
    @Input() addMode?: string;
    @Input() embedded: boolean = false;
    @Input() searchSettingsInput?: SearchSettings;
    @ViewChild('orgDetailsModal', {static: true}) orgDetailsModal!: TemplateRef<any>;
    @ViewChild('pinModal', {read: ViewContainerRef, static: false}) pinContainer!: ViewContainerRef;
    @ViewChild('autoCompleteInput', {
        read: MatAutocompleteTrigger,
        static: true
    }) autoCompleteInput!: MatAutocompleteTrigger;
    @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
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
    exporters: { [format in 'csv' | 'json' | 'odm' | 'validationRules' | 'xml']?: {id: string, display: string} } = {
        json: {id: 'jsonExport', display: 'JSON file'},
        xml: {id: 'xmlExport', display: 'XML archive'}
    };
    filterMode = true;
    goToPage = 1;
    isSearchDesktop: boolean = (window.innerWidth >= searchDesktopWidth);
    lastQueryTimeStamp?: number;
    private lastTypeahead: {[term: string]: string} = {};
    module!: ModuleItem;
    numPages?: number;
    orgs?: (Organization & {featureIcon?: string})[];
    orgHtmlOverview?: string;
    ownKeys = ownKeys;
    pinComponent!: Type<PinToBoardModalComponent>;
    pinModalComponent?: ComponentRef<PinToBoardModalComponent>;
    previousUrl?: string;
    resultsView = '';
    routerSubscription: Subscription;
    searching = false;
    searchSettings: SearchSettings = new SearchSettings();
    searchedTerm?: string;
    searchTermAutoComplete = new EventEmitter<string>();
    took?: number;
    topics?: {[topic: string]: NamedCounts};
    topicsKeys: string[] = [];
    totalItems?: number;
    totalItemsLimited?: number;
    trackByKey = trackByKey;
    trackByName = trackByName;
    view: 'welcome' | 'results' = this.isSearched() ? 'results' : 'welcome';

    constructor(protected _componentFactoryResolver: ComponentFactoryResolver,
                protected alert: AlertService,
                protected backForwardService: BackForwardService,
                protected elasticService: ElasticService,
                protected exportService: ExportService,
                protected http: HttpClient,
                protected orgHelperService: OrgHelperService,
                protected route: ActivatedRoute,
                protected router: Router,
                protected userService: UserService,
                protected dialog: MatDialog) {
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
        this.searchTermAutoComplete
            .pipe(debounceTime(500))
            .subscribe(term => {
                if (term && term.length >= 3) {
                    let url = '/server/de/completion/';
                    if (this.module === 'form') {
                        url = '/server/form/completion/';
                    }
                    this.http.post<ElasticQueryResponseHit<ItemElastic>[]>(
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
                        .subscribe(res => this.autocompleteSuggestions = res);
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
            this.searchSettings.classification = params.classification;
            if (!Array.isArray(params.classification)) {
                this.searchSettings.classification = params.classification ? params.classification.split(';') : [];
            }
            this.searchSettings.classificationAlt = params.classificationAlt ? params.classificationAlt.split(';') : [];
            this.searchSettings.datatypes = params.datatypes ? params.datatypes.split(';') as DataType[] : [];
            this.searchSettings.excludeOrgs = params.excludeOrgs ? params.excludeOrgs.split(';') : [];
            this.searchSettings.excludeAllOrgs = !!params.excludeAllOrgs;
            this.searchSettings.page = parseInt(params.page, 10) || 1;
            this.searchSettings.q = params.q;
            this.searchSettings.regStatuses = params.regStatuses ? params.regStatuses.split(';') as CurationStatus[] : [];
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

    clearSelectedStatus(status: CurationStatus) {
        if (this.searchSettings.regStatuses && removeFromArray(this.searchSettings.regStatuses, status)) {
            this.doSearch();
        }
    }

    clearSelectedTopics() {
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
        const p = ((this.totalItemsLimited || 0) / this.searchSettings.resultPerPage > 1)
            ? (this.searchSettings.page ? this.searchSettings.page : 1) + 1 : 1;
        return paramsToQueryString(this.generateSearchForTerm(p));
    }

    private filterOutWorkingGroups(cb: Cb1<string | void>) {
        this.userService.catch(noop).then(user => {
            this.orgHelperService.then(() => {
                if (this.aggregations) {
                    (this.aggregations.orgs.buckets as any) = this.aggregations.orgs.orgs.buckets
                        .filter((bucket: ElasticQueryResponseAggregationBucket) =>
                            this.orgHelperService.showWorkingGroup(bucket.key) || isSiteAdmin(user)
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

    getRegStatusHelp(name: string) {
        let result = '';
        statusList.forEach((s) => {
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
                throw assertUnreachable(searchType);
        }
    }

    // Create string representation of what filters are selected. Use the hasSelected...() first.
    getSelectedClassifications(): string[] {
        if (!this.searchSettings.selectedOrg) {
            return [];
        }
        return [this.searchSettings.selectedOrg]
            .concat(Array.isArray(this.searchSettings.classification) ? this.searchSettings.classification : []);
    }

    getSelectedClassificationsAlt(): string[] {
        if (!this.searchSettings.selectedOrgAlt) {
            return ['(Select Orgs)'];
        }
        return [this.searchSettings.selectedOrgAlt]
            .concat(Array.isArray(this.searchSettings.classificationAlt) ? this.searchSettings.classificationAlt : []);
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

    hideShowFilter() {
        this.filterMode = !this.filterMode;
    }

    isSearched() {
        return this.searchSettings.q || this.searchSettings.selectedOrg || this.searchSettings.nihEndorsed;
    }

    openOrgDetails(org: Organization) {
        this.orgHtmlOverview = org.htmlOverview;
        this.dialog.open(this.orgDetailsModal, {width: '600px'});
    }

    openPinModal() {
        if (this.pinModalComponent) {
            this.pinAll(this.pinModalComponent.instance.open());
        }
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

    pinAll(promise: Promise<any>) {
        promise.then(selectedBoard => {
            const filter = {
                reset() {
                    this.tags = [];
                    this.sortBy = 'updatedDate';
                    this.sortDirection = 'desc';
                },
                sortBy: '',
                sortDirection: '',
                tags: []
            };
            const data = {
                query: this.elasticService.buildElasticQuerySettings(this.searchSettings),
                boardId: selectedBoard._id,
                itemType: this.module
            };
            data.query.resultPerPage = MAX_PINS;
            this.http.post('/server/board/pinEntireSearchToBoard', data, {responseType: 'text'}).subscribe(() => {
                this.alert.addAlertFromComponent('success', PinBoardSnackbarComponent, {
                    message: 'All elements pinned to ',
                    boardId: selectedBoard._id,
                    boardName: selectedBoard.name
                });
                this.http.post('/server/board/myBoards', filter).subscribe();
            }, () => this.alert.addAlert('danger', 'Not all elements were not pinned!'));
        }, () => {
        });
    }

    redirect(params: Params) {
        this.router.navigate(['/' + this.module + '/search'], {queryParams: params});
    }

    reload() {
        const timestamp = new Date().getTime();
        this.lastQueryTimeStamp = timestamp;
        const lastQueryTimeStamp = this.lastQueryTimeStamp;
        this.searching = true;
        if (this.searchSettingsInput) {
            Object.assign(this.searchSettings, this.searchSettingsInput);
        }
        const settings = this.elasticService.buildElasticQuerySettings(this.searchSettings);
        this.elasticService.generalSearchQuery(settings, this.module,
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

                this.elts = this.module === 'form'
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

                    if (maxJump > (result.maxScore / 4)) {
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
                    this.aggregationsFlatClassificationsAlt = this.aggregations.flatClassificationsAlt.flatClassificationsAlt.buckets.map(
                        (c: ElasticQueryResponseAggregationBucket) => ({
                            name: c.key.split(';').pop() || '',
                            count: c.doc_count,
                        })
                    );
                } else {
                    this.aggregationsFlatClassificationsAlt = [];
                    this.aggregationsExcludeClassification = [];
                }

                this.aggregationsTopics = [];

                const aggregations = this.aggregations;
                const orgsCreatedPromise = new Promise<void>(resolve => {
                    this.filterOutWorkingGroups(() => {
                        this.orgHelperService.then(() => {
                            this.orgHelperService.addLongNameToOrgs(aggregations.orgs.buckets);
                        }, noop);
                        const [firstOrgs, otherOrgs] = partition(aggregations.orgs.buckets, org => orderedFirstOrgNames.includes(org.key));
                        firstOrgs.sort((a, b) => {
                            const A = orderedFirstOrgNames.indexOf(a.key);
                            const B = orderedFirstOrgNames.indexOf(b.key);
                            return B > A ? -1 : A === B ? 0 : 1;
                        });
                        otherOrgs.sort((a, b) => {
                            const A = a.key.toLowerCase();
                            const B = b.key.toLowerCase();
                            return B > A ? -1 : A === B ? 0 : 1;
                        });
                        aggregations.orgs.buckets = firstOrgs.concat(otherOrgs);
                        resolve();
                    });
                });

                this.aggregationsFlatClassifications.sort(SearchBaseComponent.compareObjName);
                this.aggregationsFlatClassificationsAlt.sort(SearchBaseComponent.compareObjName);
                this.aggregations.statuses.statuses.buckets.sort(
                    (a: ElasticQueryResponseAggregationBucket, b: ElasticQueryResponseAggregationBucket) =>
                        SearchBaseComponent.getRegStatusIndex(a) - SearchBaseComponent.getRegStatusIndex(b));
                this.aggregationsTopics.sort(SearchBaseComponent.compareObjName);

                this.switchView(this.isSearched() ? 'results' : 'welcome');
                if (this.view === 'welcome') {
                    this.orgs = [];
                    const orgs = this.orgs;

                    orgsCreatedPromise.then(() => {
                        this.orgHelperService.then(orgsDetailedInfo => {
                            aggregations.orgs.buckets.forEach((orgBucket: ElasticQueryResponseAggregationBucket) => {
                                if (orgsDetailedInfo[orgBucket.key]) {
                                    orgs.push({
                                        classifications: [],
                                        name: orgBucket.key,
                                        longName: orgsDetailedInfo[orgBucket.key].longName,
                                        count: orgBucket.doc_count,
                                        uri: orgsDetailedInfo[orgBucket.key].uri,
                                        extraInfo: orgsDetailedInfo[orgBucket.key].extraInfo,
                                        htmlOverview: orgsDetailedInfo[orgBucket.key].htmlOverview,
                                        cdeStatusValidationRules: []
                                    });
                                }
                            });
                            let orgIndex = 0;
                            orderedFirstOrgNames.forEach((name, i, names) => {
                                if (orgs[orgIndex].name === name) {
                                    orgs[orgIndex].featureIcon = orderedFirstOrgIcons[i];
                                    orgIndex++;
                                }
                            });
                        }, noop);
                    });

                    this.topics = {};
                    const topics = this.topics;
                    this.topicsKeys.length = 0;
                    for (const prop in this.topics) {
                        if (this.topics.hasOwnProperty(prop)) {
                            this.topicsKeys.push(prop);
                        }
                    }
                    this.topicsKeys.sort();
                }
                this.scrollHistoryLoad();
                this.searching = false;
            });
    }

    reset() {
        this.searchSettings = new SearchSettings();
        this.aggregations = undefined;
        this.doSearch();
    }

    resetFilters() {
        const endorsed = this.searchSettings.nihEndorsed;
        const org = this.searchSettings.selectedOrg;
        this.searchSettings = new SearchSettings(this.searchSettings.q);
        this.searchSettings.nihEndorsed = endorsed;
        this.searchSettings.selectedOrg = org;
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
                throw assertUnreachable(searchType);
        }
    }

    switchView(view: 'welcome' | 'results') {
        if (this.view === view || view !== 'welcome' && view !== 'results') {
            return;
        }

        this.view = view;
        if (this.view === 'results') {
            // ngAfterViewInit
            setTimeout(() => {
                const pinFactory = this._componentFactoryResolver.resolveComponentFactory(this.pinComponent);
                const intPin = setInterval(() => {
                    if (this.pinContainer) {
                        this.pinContainer.clear();
                        this.pinModalComponent = this.pinContainer.createComponent(pinFactory);
                        clearInterval(intPin);
                    }
                }, 0);
            }, 0);
        }
    }

    termSearch(reset?: boolean) {
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
            this.reload();
        } else {
            this.router.navigate([uriViewBase(this.module)],
                {queryParams: {tinyId: this.lastTypeahead[item.option.value]}});
        }
    }

    static compareObjName(a: {name: string}, b: {name: string}): number {
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
