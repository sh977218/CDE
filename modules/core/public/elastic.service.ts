import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ElasticQueryResponse } from 'core/public/models.model';

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

    constructor(public http: Http,
                @Inject('SearchSettings') protected searchSettingsService) {}

    buildElasticQuerySettings(queryParams) {
        let regStatuses = queryParams.regStatuses;
        if (!regStatuses) regStatuses = [];

        if (regStatuses.length === 0) {
            regStatuses = this.searchSettingsService.getUserDefaultStatuses();
        }

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
            , visibleStatuses: this.searchSettingsService.getUserDefaultStatuses()
            , searchToken: this.searchToken
        };
    }

    generalSearchQuery(settings, type, cb) {
        let search = (good, bad) => {
            this.http.post("/elasticSearch/" + type, settings).map(res => res.json()).subscribe(good, bad);
        };

        function success(isRetry, response: ElasticQueryResponse) {
            ElasticService.highlightResults(response[type + 's']);
            cb(null, response, isRetry);
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
        if (!cde.highlight) return;
        ElasticService.highlightOne("stewardOrgCopy.name", cde);
        ElasticService.highlightOne("primaryNameCopy", cde);
        ElasticService.highlightOne("primaryDefinitionCopy", cde);
        ElasticService.setMatchedBy(cde);
    }

    static highlightOne(field, cde) {
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
        elts.forEach(function (elt) {
            ElasticService.highlightElt(elt);
        });
    }

    static setMatchedBy(cde) {
        if (cde.highlight.primaryNameCopy) return;
        let field = null;
        let matched = Object.keys(cde.highlight)[0];
        if (matched === "naming.definition" || matched === "primaryDefinitionCopy") field = "Definition";
        if (matched.indexOf("classification.") > -1) field = "Classification";
        if (matched.indexOf(".concepts.") > -1) field = "Concepts";
        if (matched.substr(0, 11) === "valueDomain") field = "Permissible Values";
        if (matched.substr(0, 15) === "flatProperties") field = "Properties";
        if (matched === "naming.designation") field = "Alternative Name";
        if (matched === "stewardOrgCopy.name") field = "Steward";
        if (matched === "flatIds") field = "Identifier";
        cde.highlight.matchedBy = field;
    }

    getExport(query, type, cb) {
        this.http.post(
            "/elasticSearchExport/" + type,
            query
        ).map(res => res.json()).subscribe(
            function onSuccess(response) {
                cb(null, response);
            },
            function onError(response) {
                if (response.status === 503) cb("The server is busy processing similar request, please try again in a minute.");
                else cb("An error occured. This issue has been reported.");
            }
        );
    }
}