import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { UserService } from '_app/user.service';
import { LocalStorageService } from 'non-core/localStorage.service';
import { DataElement, DataElementElastic, ElasticElement, ElasticResponseDataDe } from 'shared/de/dataElement.model';
import { CdeForm, CdeFormElastic, ElasticResponseDataForm } from 'shared/form/form.model';
import { deOrForm, ElasticResponseDataItem, ItemElastic } from 'shared/item';
import { UserSearchSettings, CbErr2, Cb2, CbErr1, ModuleItem } from 'shared/models.model';
import { SearchSettings, SearchSettingsElastic } from 'shared/search/search.model';

const includeRetiredSessionKey = 'nlmcde.includeRetired';

@Injectable({ providedIn: 'root' })
export class ElasticService implements OnDestroy {
    includeRetired?: boolean;
    searchSettings!: UserSearchSettings;
    searchToken = 'id' + Math.random().toString(16).slice(2);
    unsubscribeUser?: () => void;

    constructor(
        public http: HttpClient,
        private localStorageService: LocalStorageService,
        private userService: UserService
    ) {
        this.loadSearchSettings();
    }

    ngOnDestroy() {
        if (this.unsubscribeUser) {
            this.unsubscribeUser();
            this.unsubscribeUser = undefined;
        }
    }

    buildElasticQuerySettings(queryParams: SearchSettings): SearchSettingsElastic {
        return {
            resultPerPage: queryParams.resultPerPage,
            searchTerm: queryParams.q,
            selectedOrg: queryParams.selectedOrg,
            selectedOrgAlt: queryParams.selectedOrgAlt,
            excludeAllOrgs: queryParams.excludeAllOrgs,
            excludeOrgs: queryParams.excludeOrgs || [],
            includeRetired: this.includeRetired,
            selectedElements: queryParams.classification || [],
            selectedElementsAlt: queryParams.classificationAlt || [],
            page: queryParams.page,
            includeAggregations: true,
            meshTree: queryParams.meshTree,
            selectedAdminStatuses: queryParams.adminStatuses || [],
            selectedStatuses: queryParams.regStatuses || [],
            selectedDatatypes: queryParams.datatypes || [],
            selectedCopyrightStatus: queryParams.copyrightStatus || [],
            searchToken: this.searchToken,
            nihEndorsed: !!queryParams.nihEndorsed,
            fullRecord: undefined,
        };
    }

    generalSearchQuery<T extends ElasticResponseDataDe>(
        settings: SearchSettingsElastic,
        type: 'cde',
        cb: CbErr2<T, boolean>
    ): void;
    generalSearchQuery<T extends ElasticResponseDataForm>(
        settings: SearchSettingsElastic,
        type: 'form',
        cb: CbErr2<T, boolean>
    ): void;
    generalSearchQuery<T extends ElasticResponseDataItem>(
        settings: SearchSettingsElastic,
        type: ModuleItem,
        cb: CbErr2<T, boolean>
    ): void;
    generalSearchQuery<T extends ElasticResponseDataItem>(
        settings: SearchSettingsElastic,
        type: ModuleItem,
        cb: CbErr2<T, boolean>
    ): void {
        const search = (
            good: Cb2<ElasticResponseDataItem, boolean | void>,
            bad: CbErr2<ElasticResponseDataItem, boolean | void>
        ) => {
            let url = '/server/de/search';
            if (type === 'form') {
                url = '/server/form/search';
            }
            this.http.post<ElasticResponseDataItem>(url, settings).subscribe(good as any, bad as any);
        };

        const success: Cb2<ElasticResponseDataItem, boolean | void> = (
            response: ElasticResponseDataItem,
            isRetry = false
        ) => {
            if (type === 'cde') {
                const responseDe = response as ElasticResponseDataDe;
                ElasticService.highlightResults(responseDe.cdes);
                responseDe.cdes.forEach(DataElement.validate);
            } else {
                const responseForm = response as ElasticResponseDataForm;
                ElasticService.highlightResults(responseForm.forms);
                responseForm.forms.forEach(CdeForm.validate);
            }
            (cb as CbErr2<ElasticResponseDataItem, boolean | void>)(undefined, response, isRetry);
        };

        search(success, () => {
            if (settings.searchTerm) {
                settings.searchTerm = settings.searchTerm.replace(/[^\w\s]/gi, '');
            }
            search(response => success(response, true), cb as CbErr2<ElasticResponseDataItem, boolean | void>);
        });
    }

    getDefaultSearchView() {
        return this.searchSettings.defaultSearchView;
    }

    getExport(query: SearchSettingsElastic, type: ModuleItem, cb: CbErr1<ItemElastic[] | void>) {
        this.http.post<ItemElastic[]>(`/server/${deOrForm(type)}/searchExport`, query).subscribe(
            response => cb(undefined, response),
            (err: HttpErrorResponse) => {
                cb(
                    err.status === 503
                        ? 'The server is busy processing similar request, please try again in a minute.'
                        : 'An error occurred. This issue has been reported.'
                );
            }
        );
    }

    loadSearchSettings() {
        this.searchSettings = this.localStorageService.getItem('SearchSettings') || ElasticService.getDefault();

        if (!this.unsubscribeUser) {
            this.unsubscribeUser = this.userService.subscribe(user => {
                this.searchSettings = user?.searchSettings || ElasticService.getDefault();
            });
        }

        this.includeRetired = !!window.sessionStorage.getItem(includeRetiredSessionKey);
    }

    saveConfiguration() {
        this.localStorageService.setItem('SearchSettings', this.searchSettings);
        if (this.userService.user) {
            this.http.post('/server/user/', { searchSettings: this.searchSettings }).subscribe();
        }

        if (this.includeRetired) {
            window.sessionStorage.setItem(includeRetiredSessionKey, 'true');
        } else {
            window.sessionStorage.removeItem(includeRetiredSessionKey);
        }
    }

    static getDefault(): UserSearchSettings {
        return {
            defaultSearchView: 'summary',
            tableViewFields: {
                nihEndorsed: true,
                name: true,
                naming: false,
                questionTexts: true,
                permissibleValues: true,
                nbOfPVs: true,
                uom: false,
                stewardOrg: true,
                usedBy: true,
                registrationStatus: true,
                administrativeStatus: false,
                ids: true,
                identifiers: [],
                source: false,
                updated: false,
                numQuestions: true,
                tinyId: false,
            },
        };
    }

    static highlightElt(cde: ItemElastic) {
        ElasticService.highlightOne('primaryNameCopy', cde);
        ElasticService.highlightOne('primaryDefinitionCopy', cde);
        ElasticService.highlightPrimaryDefinitionCopy(cde);
        ElasticService.setMatchedBy(cde);
    }

    static highlightPrimaryDefinitionCopy(cde: ItemElastic) {
        const primaryDefinitionCopyHighlight = cde.highlight?.primaryDefinitionCopy;
        if (!primaryDefinitionCopyHighlight) {
            if (cde.primaryDefinitionCopy && cde.primaryDefinitionCopy.length > 200) {
                cde.primaryDefinitionCopy = cde.primaryDefinitionCopy.substring(0, 200) + ' [...]';
            }
        }
    }

    static highlightOne(field: keyof DataElementElastic, cde: DataElementElastic): void;
    static highlightOne(field: keyof CdeFormElastic, cde: CdeFormElastic): void;
    static highlightOne(field: string, cde: ElasticElement & { [k: string]: any }): void;
    static highlightOne(field: string, cde: ElasticElement & { [k: string]: any }): void {
        if (!cde.highlight) {
            return;
        }
        if (cde.highlight[field]) {
            if (field.indexOf('.') < 0) {
                if (
                    cde.highlight[field][0]
                        .replace(/<strong>/g, '')
                        .replace(/<\/strong>/g, '')
                        .substr(0, 50) === cde[field].substr(0, 50)
                ) {
                    cde[field] = cde.highlight[field][0];
                } else {
                    if (cde[field].length > 50) {
                        cde[field] = cde[field].substr(0, 50) + ' [...] ' + cde.highlight[field][0];
                    }
                }
            } else {
                cde[field.replace(/\..+$/, '')][field.replace(/^.+\./, '')] = cde.highlight[field][0];
            }
        } else {
            if (field.indexOf('.') < 0) {
                cde[field] = cde[field].substr(0, 200);
                if (cde[field].length > 199) {
                    cde[field] += '...';
                }
            }
        }
    }

    static highlightResults(elts: ItemElastic[]) {
        elts.forEach(ElasticService.highlightElt);
    }

    static setMatchedBy(cde: ItemElastic) {
        let field = 'Full Document';
        if (!cde.highlight) {
            cde.highlight = { matchedBy: field };
            return;
        } else {
            if (cde.highlight.primaryNameCopy || cde.highlight.primaryDefinitionCopy) {
                return;
            }
            const matched = Object.keys(cde.highlight)[0];
            if (matched === 'definitions.definition') {
                field = 'Definition';
            }
            if (matched.indexOf('classification.') > -1) {
                field = 'Classification';
            }
            if (matched.indexOf('valueDomain.permissibleValues') > -1) {
                field = 'Permissible Values';
            }
            if (matched.indexOf('.concepts.') > -1) {
                field = 'Concepts';
            }
            if (matched.substr(0, 11) === 'valueDomain') {
                field = 'Permissible Values';
            }
            if (matched.substr(0, 15) === 'flatProperties') {
                field = 'Properties';
            }
            if (matched === 'designations.designation') {
                field = 'Other Names';
            }
            if (matched === 'stewardOrgCopy.name') {
                field = 'Steward';
            }
            if (matched === 'flatIds') {
                field = 'Identifiers';
            }
            cde.highlight.matchedBy = field;
        }
    }
}
