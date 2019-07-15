import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from '_app/user.service';
import { LocalStorageService } from 'angular-2-local-storage';
import { SearchSettings, SearchSettingsElastic } from 'search/search.model';
import {
    CbErr, Cb1, CurationStatus, ElasticQueryResponse, ItemElastic, UserSearchSettings
} from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';
import { orderedList } from 'shared/system/regStatusShared';

@Injectable()
export class ElasticService {
    searchSettings!: UserSearchSettings;
    searchToken = 'id' + Math.random().toString(16).slice(2);

    constructor(public http: HttpClient,
                private localStorageService: LocalStorageService,
                private userService: UserService) {
        this.loadSearchSettings();
    }

    buildElasticQuerySettings(queryParams: SearchSettings): SearchSettingsElastic {
        return {
            resultPerPage: queryParams.resultPerPage,
            searchTerm: queryParams.q,
            selectedOrg: queryParams.selectedOrg,
            selectedOrgAlt: queryParams.selectedOrgAlt,
            excludeAllOrgs: queryParams.excludeAllOrgs,
            excludeOrgs: queryParams.excludeOrgs || [],
            selectedElements: queryParams.classification || [],
            selectedElementsAlt: queryParams.classificationAlt || [],
            page: queryParams.page,
            includeAggregations: true,
            meshTree: queryParams.meshTree,
            selectedStatuses: queryParams.regStatuses || [],
            selectedDatatypes: queryParams.datatypes || [],
            visibleStatuses: this.getUserDefaultStatuses(),
            searchToken: this.searchToken,
            fullRecord: undefined,
        };
    }

    generalSearchQuery(settings: SearchSettingsElastic, type: 'cde' | 'form', cb: CbErr<ElasticQueryResponse, boolean>) {
        let search = (good: Cb1<ElasticQueryResponse>, bad: CbErr) => {
            this.http.post<ElasticQueryResponse>('/elasticSearch/' + type, settings).subscribe(good, bad);
        };

        function success(response: ElasticQueryResponse, isRetry = false) {
            if (type === 'cde') {
                ElasticService.highlightResults(response.cdes!);
                response.cdes!.forEach(DataElement.validate);
            } else {
                ElasticService.highlightResults(response.forms!);
                response.forms!.forEach(CdeForm.validate);
            }
            cb(undefined, response, isRetry);
        }

        search(success, () => {
            if (settings.searchTerm) settings.searchTerm = settings.searchTerm.replace(/[^\w\s]/gi, '');
            search(response => success(response, true), cb);
        });
    }

    static getDefault(): UserSearchSettings {
        return {
            defaultSearchView: 'summary',
            lowestRegistrationStatus: 'Qualified',
            tableViewFields: {
                name: true,
                naming: false,
                questionTexts: true,
                permissibleValues: true,
                pvCodeNames: false,
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
                tinyId: false
            },
            version: 20160329,
        };
    }

    getDefaultSearchView() {
        return this.searchSettings.defaultSearchView;
    }

    getExport(query: SearchSettingsElastic, type: 'cde' | 'form', cb: CbErr<ItemElastic[]>) {
        this.http.post<ItemElastic[]>('/elasticSearchExport/' + type, query).subscribe(
            response => cb(undefined, response),
            (err: HttpErrorResponse) => {
                if (err.status === 503) cb('The server is busy processing similar request, please try again in a minute.');
                else cb('An error occured. This issue has been reported.');
            }
        );
    }

    getUserDefaultStatuses(): CurationStatus[] {
        let overThreshold = false;
        let result = orderedList.filter(status => {
            if (overThreshold) return false;
            overThreshold = this.searchSettings.lowestRegistrationStatus === status;
            return true;
        });
        if (this.searchSettings.includeRetired) result.push('Retired');
        return result;
    }

    // static highlight(field1: string, field2: string, cde) {
    //     if (cde.highlight[field1 + '.' + field2]) {
    //         cde.highlight[field1 + '.' + field2].forEach(function (nameHighlight) {
    //             let elements;
    //             if (field1.indexOf('.') < 0) elements = cde[field1];
    //             else elements = cde[field1.replace(/\..+$/, '')][field1.replace(/^.+\./, '')];
    //             elements.forEach((nameCde, i: number) => {
    //                 if (nameCde[field2] === nameHighlight.replace(/<[^>]+>/gm, '')) {
    //                     nameCde[field2] = nameHighlight;
    //                     if (field2 === 'designation' && i === 0) cde.highlight.primaryName = true;
    //                 }
    //             });
    //
    //         });
    //     }
    // }

    static highlightElt(cde: ItemElastic) {
        ElasticService.highlightOne('primaryNameCopy', cde);
        ElasticService.highlightOne('primaryDefinitionCopy', cde);
        ElasticService.setMatchedBy(cde);
    }

    static highlightOne(field: string, cde: ItemElastic) {
        if (!cde.highlight) return;
        if (cde.highlight[field]) {
            if (field.indexOf('.') < 0) {
                if (cde.highlight[field][0].replace(/<strong>/g, "").replace(/<\/strong>/g, "")
                    .substr(0, 50) === cde[field].substr(0, 50)) {
                    cde[field] = cde.highlight[field][0];
                } else {
                    if (cde[field].length > 50) {
                        cde[field] = cde[field].substr(0, 50) + ' [...] ' + cde.highlight[field][0];
                    }
                }
            } else cde[field.replace(/\..+$/, "")][field.replace(/^.+\./, "")] = cde.highlight[field][0];
        } else {
            if (field.indexOf('.') < 0) {
                cde[field] = cde[field].substr(0, 200);
                if (cde[field].length > 199) cde[field] += '...';
            }
        }
    }

    static highlightResults(elts: ItemElastic[]) {
        elts.forEach(ElasticService.highlightElt);
    }

    loadSearchSettings() {
        if (!this.searchSettings) {
            this.searchSettings = this.localStorageService.get('SearchSettings');
            if (!this.searchSettings) this.searchSettings = ElasticService.getDefault();

            this.userService.then(user => {
                if (!user.searchSettings) {
                    user.searchSettings = ElasticService.getDefault();
                }
                this.searchSettings = user.searchSettings;
                if (this.searchSettings.version !== ElasticService.getDefault().version) {
                    this.searchSettings = ElasticService.getDefault();
                }
            }, () => {
                if (this.searchSettings.version !== ElasticService.getDefault().version) {
                    this.searchSettings = ElasticService.getDefault();
                }
            });
        }
    }

    saveConfiguration(settings: UserSearchSettings) {
        this.searchSettings = settings;
        let savedSettings = JSON.parse(JSON.stringify(this.searchSettings));
        delete savedSettings.includeRetired;
        this.localStorageService.set('SearchSettings', savedSettings);
        if (this.userService.user) {
            this.http.post('/server/user/', {searchSettings: savedSettings}).subscribe();
        }
    }

    static setMatchedBy(cde: ItemElastic) {
        let field = 'Full Document';
        if (!cde.highlight) {
            cde.highlight = {matchedBy: field};
            return;
        } else {
            if (cde.highlight.primaryNameCopy || cde.highlight.primaryDefinitionCopy) return;
            let matched = Object.keys(cde.highlight)[0];
            if (matched === 'definitions.definition') field = 'Definition';
            if (matched.indexOf('classification.') > -1) field = 'Classification';
            if (matched.indexOf('valueDomain.permissibleValues') > -1) field = 'Permissible Values';
            if (matched.indexOf('.concepts.') > -1) field = 'Concepts';
            if (matched.substr(0, 11) === 'valueDomain') field = 'Permissible Values';
            if (matched.substr(0, 15) === 'flatProperties') field = 'Properties';
            if (matched === 'designations.designation') field = 'Other Names';
            if (matched === 'stewardOrgCopy.name') field = 'Steward';
            if (matched === 'flatIds') field = 'Identifiers';
            cde.highlight.matchedBy = field;
        }
    }
}
