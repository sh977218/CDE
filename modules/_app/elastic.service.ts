import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';

import { UserService } from '_app/user.service';
import { Cb, CbErr, ElasticQueryResponse } from 'shared/models.model';
import { DataElementElastic } from 'shared/de/dataElement.model';
import { CdeFormElastic } from 'shared/form/form.model';
import { orderedList } from 'shared/system/regStatusShared';

@Injectable()
export class ElasticService {
    defaultSearchSettings = {
        q: ""
        , page: 1
        , classification: []
        , classificationAlt: []
        , regStatuses: []
        , resultPerPage: 20
    };
    searchToken = "id" + Math.random().toString(16).slice(2);

    searchSettings: any;

    constructor(public http: HttpClient,
                private localStorageService: LocalStorageService,
                private userService: UserService) {
        this.loadSearchSettings();
    }

    buildElasticQuerySettings(queryParams) {
        let regStatuses = queryParams.regStatuses;
        if (!regStatuses) regStatuses = [];

        return {
            resultPerPage: queryParams.resultPerPage
            , searchTerm: queryParams.q
            , selectedOrg: queryParams.selectedOrg
            , selectedOrgAlt: queryParams.selectedOrgAlt
            , selectedElements: queryParams.classification || []
            , selectedElementsAlt: queryParams.classificationAlt || []
            , page: queryParams.page
            , includeAggregations: true
            , meshTree: queryParams.meshTree
            , selectedStatuses: regStatuses || []
            , selectedDatatypes: queryParams.datatypes || []
            , visibleStatuses: this.getUserDefaultStatuses()
            , searchToken: this.searchToken
            , fullRecord: null
        };
    }

    generalSearchQuery(settings, type: 'cde'|'form', cb: CbErr<ElasticQueryResponse, boolean>) {
        let search = (good: Cb<ElasticQueryResponse>, bad: CbErr) => {
            this.http.post("/elasticSearch/" + type, settings).subscribe(good, bad);
        };

        function success(isRetry: boolean, response: ElasticQueryResponse) {
            ElasticService.highlightResults(response[type + 's']);
            cb('', response, isRetry);
        }

        search(success.bind(null, false), function failOne() {
            if (settings.searchTerm) settings.searchTerm = settings.searchTerm.replace(/[^\w\s]/gi, '');
            search(success.bind(null, true), function failTwo() {
                cb("Error");
            });
        });
    }

    static highlight(field1, field2, cde) {
        if (cde.highlight[field1 + "." + field2]) {
            cde.highlight[field1 + "." + field2].forEach(function (nameHighlight) {
                let elements;
                if (field1.indexOf(".") < 0) elements = cde[field1];
                else elements = cde[field1.replace(/\..+$/, "")][field1.replace(/^.+\./, "")];
                elements.forEach(function (nameCde, i) {
                    if (nameCde[field2] === nameHighlight.replace(/<[^>]+>/gm, '')) {
                        nameCde[field2] = nameHighlight;
                        if (field2 === "designation" && i === 0) cde.highlight.primaryName = true;
                    }
                });

            });
        }
    }

    static highlightElt(cde) {
        ElasticService.highlightOne("primaryNameCopy", cde);
        ElasticService.highlightOne("primaryDefinitionCopy", cde);
        ElasticService.setMatchedBy(cde);
    }

    static highlightOne(field, cde) {
        if (!cde.highlight) return;
        if (cde.highlight[field]) {
            if (field.indexOf(".") < 0) {
                if (cde.highlight[field][0].replace(/<strong>/g, "").replace(/<\/strong>/g, "")
                        .substr(0, 50) === cde[field].substr(0, 50)) {
                    cde[field] = cde.highlight[field][0];
                } else {
                    cde[field] = cde[field].substr(0, 50) + " [...] " + cde.highlight[field][0];
                }
            }
            else cde[field.replace(/\..+$/, "")][field.replace(/^.+\./, "")] = cde.highlight[field][0];
        } else {
            if (field.indexOf(".") < 0) {
                cde[field] = cde[field].substr(0, 200);
                if (cde[field].length > 199) cde[field] += "...";
            }
        }
    }

    static highlightResults(elts) {
        elts.forEach(elt => ElasticService.highlightElt(elt));
    }

    static setMatchedBy(cde) {
        let field = "Full Document";
        if (!cde.highlight) {
            cde.highlight = {matchedBy: field};
            return;
        } else {
            if (cde.highlight.primaryNameCopy || cde.highlight.primaryDefinitionCopy) return;
            let matched = Object.keys(cde.highlight)[0];
            if (matched === "definitions.definition") field = "Definition";
            if (matched.indexOf("classification.") > -1) field = "Classification";
            if (matched.indexOf("valueDomain.permissibleValues") > -1) field = "Permissible Values";
            if (matched.indexOf(".concepts.") > -1) field = "Concepts";
            if (matched.substr(0, 11) === "valueDomain") field = "Permissible Values";
            if (matched.substr(0, 15) === "flatProperties") field = "Properties";
            if (matched === "designations.designation") field = "Other Names";
            if (matched === "stewardOrgCopy.name") field = "Steward";
            if (matched === "flatIds") field = "Identifiers";
            cde.highlight.matchedBy = field;
        }
    }

    getExport(query, type, cb) {
        this.http.post("/elasticSearchExport/" + type, query).subscribe(
            response => cb(null, response),
            err => {
                if (err.status === 503) cb("The server is busy processing similar request, please try again in a minute.");
                else cb("An error occured. This issue has been reported.");
            }
        );
    }

    saveConfiguration(settings) {
        this.searchSettings = settings;
        let savedSettings = JSON.parse(JSON.stringify(this.searchSettings));
        delete savedSettings.includeRetired;
        this.localStorageService.set("SearchSettings", savedSettings);
        if (this.userService.user) {
            this.http.post("/server/user/", {searchSettings: savedSettings}).subscribe();
        }
    }

    getDefault() {
        return {
            "version": 20160329
            , "defaultSearchView": "summary"
            , "lowestRegistrationStatus": "Qualified"
            , "tableViewFields": {
                "name": true,
                "naming": false,
                "questionTexts": true,
                "permissibleValues": true,
                "pvCodeNames": false,
                "nbOfPVs": true,
                "uom": false,
                "stewardOrg": true,
                "usedBy": true,
                "registrationStatus": true,
                "administrativeStatus": false,
                "ids": true,
                "identifiers": [],
                "source": false,
                "updated": false,
                "numQuestions": true,
                "tinyId": false
            }
        };
    }

    getDefaultSearchView() {
        return this.searchSettings.defaultSearchView;
    }

    getUserDefaultStatuses() {
        let overThreshold = false;
        let result = orderedList.filter(status => {
            if (overThreshold) return false;
            overThreshold = this.searchSettings.lowestRegistrationStatus === status;
            return true;
        });
        if (this.searchSettings.includeRetired) result.push("Retired");
        return result;
    }

    loadSearchSettings() {
        if (!this.searchSettings) {
            this.searchSettings = this.localStorageService.get("SearchSettings");
            if (!this.searchSettings) this.searchSettings = this.getDefault();

            this.userService.then(user => {
                if (!user.searchSettings) {
                    user.searchSettings = this.getDefault();
                }
                this.searchSettings = user.searchSettings;
                if (this.searchSettings.version !== this.getDefault().version) {
                    this.searchSettings = this.getDefault();
                }
            }, () => {
                if (this.searchSettings.version !== this.getDefault().version) {
                    this.searchSettings = this.getDefault();
                }
            });
        }
    }
}
