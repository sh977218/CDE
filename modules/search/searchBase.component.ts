import {
    Component, ViewChild, Type, ViewContainerRef, EventEmitter, AfterViewInit, HostListener,
    OnInit, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { SearchSettings } from './search.model';
import { SharedService } from 'core/public/shared.service';
import { NgbModal, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { CdeForm } from 'form/public/form.model';
import { DataElement } from 'cde/public/dataElement.model';
import { ElasticQueryResponse, Elt, User } from 'core/public/models.model';
import { HelperObjectsService } from 'widget/helperObjects.service';

export abstract class SearchBaseComponent implements AfterViewInit, OnInit, OnChanges {
    @Input() reloads: number;
    @HostListener('window:beforeunload') unload() {
        if (/^\/(cde|form)\/search$/.exec(location.pathname))
            window.sessionStorage['nlmcde.scroll.' + location.pathname + location.search] = window.scrollY;
    }
    @ViewChild('orgDetailsModal') orgDetailsModal: NgbModal;
    @ViewChild('pinModal', {read: ViewContainerRef}) pinContainer: ViewContainerRef;
    @ViewChild('tbset') public tabset: NgbTabset;
    @ViewChild('validRulesModal') validRulesModal: NgbModal;
    accordionListStyle: string;
    add: EventEmitter<any>;
    addMode: string;
    aggregations: any;
    altClassificationFilterMode: boolean;
    byTopic: boolean;
    cutoffIndex: any;
    elts: Elt[];
    embedded = false;
    exporters: any = {
        json: {id: "jsonExport", display: "JSON Export"},
        xml: {id: "xmlExport", display: "XML Export"}
    };
    filterMode = true;
    helperObjectsService = HelperObjectsService;
    lastQueryTimeStamp: number;
    module: string;
    numPages: any;
    oninit = false;
    orgs: any[];
    orgHtmlOverview: string;
    pinComponent: Type<Component>;
    pinModalComponent: any;
    redirectPath: string;
    resultsView: string;
    resultPerPage = 20;
    searchSettings: SearchSettings = new SearchSettings;
    searchedTerm: string;
    took: any;
    topics: any;
    topicsKeys: string[];
    totalItems: any;
    user: User;
    validRulesStatus: string;
    view: string;

    ngAfterViewInit() {
        let previousSpot = window.sessionStorage['nlmcde.scroll.' + location.pathname + location.search];
        if (previousSpot != null)
            SearchBaseComponent.waitScroll(2, previousSpot);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.reloads) {
            this.oninit = true;
            this.search();
        }
    }

    ngOnInit () {
        // TODO: remove OnInit when OnChanges inputs is implemented for Dynamic Components
        if (!this.oninit)
            this.search();
    }

    constructor(protected _componentFactoryResolver,
                protected alert,
                protected elasticService,
                protected exportService,
                protected http,
                protected modalService,
                protected orgHelperService,
                protected userService) {
        this.searchSettings.page = 1;

        // TODO: upgrade to Angular when router is available
        // scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        //     let match = /\/(cde|form)\/search\?.*/.exec(oldUrl);
        //     if (match)
        //         window.sessionStorage['nlmcde.scroll.' + match[0]] = $(window).scrollTop();
        // });

        this.filterMode = $(window).width() >= 768;
    }

    addDatatypeFilter(datatype) {
        if (!this.searchSettings.datatypes)
            this.searchSettings.datatypes = [];
        let index = this.searchSettings.datatypes.indexOf(datatype);
        if (index > -1)
            this.searchSettings.datatypes.splice(index, 1);
        else
            this.searchSettings.datatypes.push(datatype);

        this.doSearch();
    }

    addStatusFilter(status) {
        if (!this.searchSettings.regStatuses)
            this.searchSettings.regStatuses = [];
        let index = this.searchSettings.regStatuses.indexOf(status);
        if (index > -1)
            this.searchSettings.regStatuses.splice(index, 1);
        else
            this.searchSettings.regStatuses.push(status);

        this.doSearch();
    }

    alterOrgFilter(orgName) {
        let orgToAlter = this.altClassificationFilterMode ? this.searchSettings.selectedOrgAlt : this.searchSettings.selectedOrg;
        let classifToAlter = this.getCurrentSelectedClassification();

        if (orgToAlter === undefined) {
            if (this.altClassificationFilterMode) {
                this.searchSettings.selectedOrgAlt = orgName;
            } else {
                this.searchSettings.selectedOrg = orgName;
            }
        } else {
            if (this.altClassificationFilterMode) {
                this.searchSettings.selectedOrgAlt = undefined;
            } else {
                this.searchSettings.selectedOrg = undefined;
            }
            classifToAlter.length = 0;
        }
        delete this.aggregations.groups;
        if (this.isSearched()) {
            this.doSearch();
            if (!this.embedded)
                SearchBaseComponent.focusClassification();
        } else
            this.reset();
    }

    autocompleteSuggest(searchTerm) {
        return this.http.get('/cdeCompletion/' + encodeURI(searchTerm), {})
            .map(res => res.json());
    }

    browseOrg(orgName) {
        this.searchSettings.selectedOrg = orgName;

        this.doSearch();
        if (!this.embedded)
            SearchBaseComponent.scrollTo('top');
    }

    browseTopic(topic) {
        this.searchSettings.meshTree = topic;

        this.doSearch();
        if (!this.embedded)
            SearchBaseComponent.scrollTo('top');
    }

    browseByTopic(event) {
        this.byTopic = event.nextId !== 'treeViewTab';

        this.doSearch();
    }

    clearSelectedClassifications() {
        this.searchSettings.selectedOrg = null;
        if (this.searchSettings.classification)
            this.searchSettings.classification.length = 0;

        if (this.hasSelectedClassificationsAlt()) {
            this.searchSettings.selectedOrg = this.searchSettings.selectedOrgAlt;
            if (this.searchSettings.classificationAlt && this.searchSettings.classificationAlt.length > 0) {
                this.searchSettings.classification = this.searchSettings.classificationAlt;
                this.searchSettings.classificationAlt = null;
            }
        }

        this.clearSelectedClassificationsAlt();
    }

    clearSelectedClassificationsAlt() {
        this.altClassificationFilterMode = false;
        this.searchSettings.selectedOrgAlt = null;
        if (this.searchSettings.classificationAlt)
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
        if (a > b)
            return 1;
        if (a < b)
            return -1;
        if (a === b)
            return 0;
        return NaN;
    }

    displayValidation() {
        let org = this.searchSettings.selectedOrg;
        let curatorOf = [].concat(this.userService.user.orgAdmin).concat(this.userService.user.orgCurator);
        return curatorOf.indexOf(org) > -1 || SharedService.auth.hasRole(this.userService.user, 'OrgAuthority');
    }

    doSearch() {
        if (!this.embedded) {
            let loc = this.generateSearchForTerm();
            window.sessionStorage.removeItem('nlmcde.scroll.' + loc);
            this.redirect(loc);
        } else
            this.reload();
    }

    fakeNextPageLink() {
        let p = (this.totalItems / this.resultPerPage > 1)
            ? (this.searchSettings.page ? this.searchSettings.page : 1) + 1
            : 1;
        return this.generateSearchForTerm(p);
    }

    private filterOutWorkingGroups(cb) {
        this.orgHelperService.then(() => {
            this.userService.getPromise().then(() => {
                this.aggregations.orgs.buckets = this.aggregations.orgs.orgs.buckets.filter(bucket => {
                    return this.orgHelperService.showWorkingGroup(bucket.key, this.userService.user)
                        || this.userService.user.siteAdmin;
                });
                cb();
            });
        });
    }

    static focusClassification() {
        // any good angular way to do this?
        $('#classif_filter_title').focus(); // jshint ignore:line
    }

    static focusTopic() {
        $('#meshTrees_filter').focus();
    }

    generateSearchForTerm(pageNumber = null) {
        // TODO: replace with router
        let searchTerms = [];
        if (this.searchSettings.q)
            searchTerms.push('q=' + encodeURIComponent(this.searchSettings.q));
        if (this.searchSettings.regStatuses && this.searchSettings.regStatuses.length > 0)
            searchTerms.push('regStatuses=' + this.searchSettings.regStatuses.join(';'));
        if (this.searchSettings.datatypes && this.searchSettings.datatypes.length > 0)
            searchTerms.push('datatypes=' + encodeURIComponent(this.searchSettings.datatypes.join(';')));
        if (this.searchSettings.selectedOrg)
            searchTerms.push('selectedOrg=' + encodeURIComponent(this.searchSettings.selectedOrg));
        if (this.searchSettings.classification && this.searchSettings.classification.length > 0)
            searchTerms.push('classification=' + encodeURIComponent(this.searchSettings.classification.join(';')));
        if (this.searchSettings.selectedOrgAlt)
            searchTerms.push('selectedOrgAlt=' + encodeURIComponent(this.searchSettings.selectedOrgAlt));
        if (this.altClassificationFilterMode)
            if (this.searchSettings.classificationAlt && this.searchSettings.classificationAlt.length > 0)
                searchTerms.push('classificationAlt=' + encodeURIComponent(this.searchSettings.classificationAlt.join(';')));
        if (pageNumber && pageNumber > 1)
            searchTerms.push('page=' + pageNumber);
        else if (this.searchSettings.page && this.searchSettings.page > 1)
            searchTerms.push('page=' + this.searchSettings.page);
        if (this.searchSettings.meshTree)
            searchTerms.push('topic=' + encodeURIComponent(this.searchSettings.meshTree));
        if (this.byTopic && !this.isSearched())
            searchTerms.push('byTopic');
        return '/' + this.module + '/search?' + searchTerms.join('&');
    }

    getAutocompleteSuggestions = (text$: Observable<string>) =>
        text$.debounceTime(500).distinctUntilChanged().switchMap(term =>
            term.length >= 3
                ? this.autocompleteSuggest(term)
                : Observable.empty()
        ).take(8);

    getCurrentSelectedClassification() {
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

    getRegStatusHelp(key) {
        let result = '';
        SharedService.regStatusShared.statusList.forEach(function (s) { // jshint ignore:line
            if (s.name === key) result = s.help;
        });
        return result;
    }

    static getRegStatusIndex(rg) {
        return SharedService.regStatusShared.orderedList.indexOf(rg.key);
    }

    // Create string representation of what filters are selected. Use the hasSelected...() first.
    getSelectedClassifications() {
        let result = this.searchSettings.selectedOrg;
        if (this.searchSettings.classification && this.searchSettings.classification.length > 0)
            result += ' > ' + this.searchSettings.classification.join(' > ');
        return result;
    }

    getSelectedClassificationsAlt() {
        let result = this.searchSettings.selectedOrgAlt;
        if (this.searchSettings.classificationAlt.length > 0)
            result += ' > ' + this.searchSettings.classificationAlt.join(' > ');
        return result;
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

    keys(obj) {
        return Object.keys(obj);
    }

    openOrgDetails(org) {
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
            let params = new URLSearchParams;
            params.set('searchSettings', JSON.stringify(report.searchSettings));
            params.set('status', report.status);
            let uri = params.toString();
            window.location.href = '/cdeStatusReport?' + uri;
        }, function () {
        });
    }

    pageChange() {
        this.doSearch();
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
                query: this.elasticService.buildElasticQuerySettings(this.searchSettings)
                , board: selectedBoard
                , itemType: this.module
            };
            data.query.resultPerPage = (<any>window).maxPin;
            this.http.post('/pinEntireSearchToBoard', data).subscribe(() => {
                this.alert.addAlert('success', 'All elements pinned.');
                this.http.post('/myBoards', filter).subscribe();
            }, () => {
                this.alert.addAlert('danger', 'Not all elements were not pinned!');
            });
        }, () => {
        });
    }

    redirect(url: string) {
        this.redirectPath = url;
        setTimeout(function () {
            (document.querySelector('#redirectMe')as any).click();
        }, 0);
    }

    reload() {
        this.userService.getPromise().then(() => {
            let timestamp = new Date().getTime();
            this.lastQueryTimeStamp = timestamp;
            this.accordionListStyle = 'semi-transparent';
            let settings = this.elasticService.buildElasticQuerySettings(this.searchSettings);
            this.elasticService.generalSearchQuery(settings, this.module, (err: string, result: ElasticQueryResponse, corrected: boolean) => {
                this.searchedTerm = this.searchSettings.q;
                if (corrected && this.searchSettings.q)
                    this.searchedTerm = this.searchedTerm.replace(/[^\w\s]/gi, '');
                if (err) {
                    this.accordionListStyle = '';
                    this.alert.addAlert('danger', 'There was a problem with your query');
                    this[module + 's'] = [];
                    return;
                }
                if (timestamp < this.lastQueryTimeStamp) return;
                this.numPages = Math.ceil(result.totalNumber / this.resultPerPage);
                this.took = result.took;
                this.totalItems = result.totalNumber;

                // Convert Elastic JSON to Elt Object
                this.elts = result[this.module + 's'];
                if (this.module === 'cde')
                    this.elts.forEach((elt, i, elts) => elts[i] = Object.assign(new DataElement, elt));
                if (this.module === 'form')
                    this.elts.forEach((elt, i, elts) => elts[i] = Object.assign(new CdeForm, elt));

                if (this.searchSettings.page === 1 && result.totalNumber > 0) {
                    let maxJump = 0;
                    let maxJumpIndex = 100;
                    this.elts.map((e, i) => {
                        if (!this.elts[i + 1]) return;
                        let jump = e.score - this.elts[i + 1].score;
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

                this.elts.forEach(elt => {
                    this.orgHelperService.then(() => {
                        elt.usedBy = this.orgHelperService.getUsedBy(elt, this.userService.user);
                    });
                });
                this.accordionListStyle = '';

                this.aggregations = result.aggregations;

                if (result.aggregations !== undefined) {
                    if (result.aggregations.flatClassifications !== undefined) {
                        this.aggregations.flatClassifications = result.aggregations.flatClassifications.flatClassifications.buckets.map(function (c) {
                            return {name: c.key.split(';').pop(), count: c.doc_count};
                        });
                    } else {
                        this.aggregations.flatClassifications = [];
                    }

                    if (result.aggregations.flatClassificationsAlt !== undefined) {
                        this.aggregations.flatClassificationsAlt = result.aggregations.flatClassificationsAlt.flatClassificationsAlt.buckets.map(function (c) {
                            return {name: c.key.split(';').pop(), count: c.doc_count};
                        });
                    } else {
                        this.aggregations.flatClassificationsAlt = [];
                    }

                    if (result.aggregations.meshTrees !== undefined) {
                        if (this.searchSettings.meshTree) {
                            this.aggregations.topics = result.aggregations.meshTrees.meshTrees.buckets.map(function (c) {
                                return {name: c.key.split(';').pop(), count: c.doc_count};
                            });
                        } else {
                            this.aggregations.topics = result.aggregations.meshTrees.meshTrees.buckets.map(function (c) {
                                return {name: c.key.split(';')[0], count: c.doc_count};
                            });
                        }
                    } else {
                        this.aggregations.topics = [];
                    }

                }

                let orgsCreatedPromise = new Promise(resolve => {
                    this.filterOutWorkingGroups(() => {
                        this.orgHelperService.then(() => this.orgHelperService.addLongNameToOrgs(
                            this.aggregations.orgs.buckets, this.orgHelperService.orgsDetailedInfo));
                        this.aggregations.orgs.buckets.sort(function (a, b) {
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
                this.aggregations.statuses.statuses.buckets.sort(function (a, b) {
                    return SearchBaseComponent.getRegStatusIndex(a) - SearchBaseComponent.getRegStatusIndex(b);
                });
                this.aggregations.topics.sort(SearchBaseComponent.compareObjName);

                this.switchView(this.isSearched() ? 'results' : 'welcome');
                if (this.view === 'welcome') {
                    this.orgs = [];

                    if (this.aggregations) {
                        orgsCreatedPromise.then(() => {
                            this.orgHelperService.then(() => {
                                this.aggregations.orgs.buckets.forEach(org_t => {
                                    if (this.orgHelperService.orgsDetailedInfo[org_t.key])
                                        this.orgs.push({
                                            name: org_t.key,
                                            longName: this.orgHelperService.orgsDetailedInfo[org_t.key].longName,
                                            count: org_t.doc_count,
                                            source: this.orgHelperService.orgsDetailedInfo[org_t.key].uri,
                                            extraInfo: this.orgHelperService.orgsDetailedInfo[org_t.key].extraInfo,
                                            htmlOverview: this.orgHelperService.orgsDetailedInfo[org_t.key].htmlOverview
                                        });
                                });
                                this.orgs.sort(SearchBaseComponent.compareObjName);
                            });
                        });
                    }

                    this.topics = {};
                    this.topicsKeys = [];
                    if (this.aggregations) {
                        this.aggregations.twoLevelMesh.twoLevelMesh.buckets.forEach(term => {
                            let spli = term.key.split(';');
                            if (!this.topics[spli[0]]) {
                                this.topics[spli[0]] = [];
                            }
                            this.topics[spli[0]].push({name: spli[1], count: term.doc_count});
                        });
                        for (let prop in this.topics) {
                            if (this.topics.hasOwnProperty(prop))
                                this.topicsKeys.push(prop);
                        }
                        this.topicsKeys.sort(SearchBaseComponent.compareObjName);
                    }
                }
            });
        });
    }

    reset() {
        this.initSearch();
        this.aggregations = null;
        this.doSearch();
    }

    static scrollTo(id) {
        const element = document.querySelector('#' + id);
        if (element)
            element.scrollIntoView(element);
    }

    search() {
        // TODO: replace with router
        let params = SearchBaseComponent.searchParamsGet();
        this.searchSettings.q = params['q'];
        this.searchSettings.page = params['page'];
        if (!this.searchSettings.page)
            this.searchSettings.page = 1;
        this.searchSettings.selectedOrg = params['selectedOrg'];
        this.searchSettings.selectedOrgAlt = params['selectedOrgAlt'];
        this.altClassificationFilterMode = !!params['selectedOrgAlt'];
        this.searchSettings.classification = params['classification'] ? params['classification'].split(';') : [];
        this.searchSettings.classificationAlt = params['classificationAlt'] ? params['classificationAlt'].split(';') : [];
        this.searchSettings.regStatuses = params['regStatuses'] ? params['regStatuses'].split(';') : [];
        this.searchSettings.datatypes = params['datatypes'] ? params['datatypes'].split(';') : [];
        this.searchSettings.meshTree = params['topic'];
        this.byTopic = params.hasOwnProperty('byTopic');
        this.reload();
    }

    static searchParamsGet(): string[] {
        let params: any = {};
        location.search && location.search.substr(1).split('&').forEach(e => {
            let p = e.split('=');
            if (p.length === 2)
                params[p[0]] = decodeURIComponent(p[1]);
            else
                params[p[0]] = null;
        });
        return params;
    }

    static searchParamsSet(params): string {
        let search = [];
        for (let p in params) {
            if (params.hasOwnProperty(p)) {
                if (params[p] !== null)
                    search.push(p + '=' + encodeURIComponent(params[p]));
                else
                    search.push('' + p);
            }
        }
        return location.origin + location.pathname + '?' + search.join('&');
    }

    selectElement(e) {
        if (this.altClassificationFilterMode && !this.searchSettings.classificationAlt)
            this.searchSettings.classificationAlt = [];
        if (!this.altClassificationFilterMode && !this.searchSettings.classification)
            this.searchSettings.classification = [];

        let classifToSelect = this.altClassificationFilterMode ? this.searchSettings.classificationAlt : this.searchSettings.classification;
        if (classifToSelect.length === 0) {
            classifToSelect.length = 0;
            classifToSelect.push(e);
        } else {
            let i = classifToSelect.indexOf(e);
            if (i > -1) {
                classifToSelect.length = i;
            } else {
                classifToSelect.push(e);
            }
        }

        this.doSearch();
        if (!this.embedded)
            SearchBaseComponent.focusClassification();
    }

    selectTopic(topic) {
        let toSelect = !this.searchSettings.meshTree ? [] :
            this.searchSettings.meshTree.split(';');
        let i = toSelect.indexOf(topic);
        if (i > -1) {
            toSelect.length = i;
        } else {
            toSelect.push(topic);
        }
        this.searchSettings.meshTree = toSelect.join(';');

        this.doSearch();
        if (!this.embedded)
            SearchBaseComponent.focusTopic();
    }

    setAltClassificationFilterMode() {
        this.altClassificationFilterMode = true;

        this.doSearch();
        if (!this.embedded)
            SearchBaseComponent.focusClassification();
    }

    switchView(view) {
        if (this.view === view || view !== 'welcome' && view !== 'results')
            return;

        this.view = view;
        if (this.view === 'welcome') {
            // ngAfterViewChecked
            setTimeout(() => {
                if (this.byTopic)
                    this.tabset.select('topicTab');
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
        this.searchSettings.selectedOrgAlt = null;
        this.altClassificationFilterMode = false;

        if (this.searchSettings.meshTree) {
            let index = this.searchSettings.meshTree.indexOf(';');
            if (index > -1)
                index = this.searchSettings.meshTree.indexOf(';', index + 1);
            if (index > -1)
                this.searchSettings.meshTree = this.searchSettings.meshTree.substr(0, index);
        }

        this.doSearch();
    }

    static waitScroll(count, previousSpot) {
        if (count > 0)
            setTimeout(function () {
                SearchBaseComponent.waitScroll(count - 1, previousSpot);
            }, 100);
        else
            window.scrollTo(0, previousSpot);
    }
}
