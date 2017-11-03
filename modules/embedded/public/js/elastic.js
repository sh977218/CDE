angular.module('ElasticSearchResource', ['ngResource'])
    .factory('Elastic', ["$http", "SearchSettings", function($http, SearchSettings) {
        return {
            defaultSearchSettings: {
                q: ""
                , page: 1
                , classification: []
                , classificationAlt: []
                , regStatuses: []
                , resultPerPage: 20
            },
            searchToken: "id" + Math.random().toString(16).slice(2)
            , buildElasticQuerySettings: function(queryParams) {
                var regStatuses = queryParams.regStatuses;
                if (!regStatuses) regStatuses = [];

                if (regStatuses.length === 0) {
                    regStatuses = SearchSettings.getUserDefaultStatuses();
                }

                return {
                    resultPerPage: queryParams.resultPerPage
                    , searchTerm: queryParams.q
                    , selectedOrg: queryParams.selectedOrg
                    , selectedOrgAlt: queryParams.selectedOrgAlt
                    , selectedElements: queryParams.classification
                    , selectedElementsAlt: queryParams.classificationAlt
                    , page: queryParams.page
                    , includeAggregations: true
                    , meshTree: queryParams.meshTree
                    , selectedStatuses: regStatuses
                    , selectedDatatypes: queryParams.datatypes
                    , visibleStatuses: SearchSettings.getUserDefaultStatuses()
                    , searchToken: this.searchToken
                };
            }
            , generalSearchQuery: function(settings, type, cb) {
                var elastic = this;
                function search(good, bad){
                    $http.post("/elasticSearch/" + type, settings)
                        .then(good, bad);
                }
                function success(response) {
                    elastic.highlightResults(response.data[type + 's']);
                    cb(null, response.data, false);
                }
                function successAfterRetry(response) {
                    elastic.highlightResults(response.data[type + 's']);
                    cb(null, response.data, true);
                }

                search(success, function failOne() {
                    if (settings.searchTerm) settings.searchTerm = settings.searchTerm.replace(/[^\w\s]/gi, '');
                    search(successAfterRetry, function failTwo() {
                        cb("Error");
                    });
                });

            }
            , highlightResults: function(elts) {
                var elastic = this;
                elts.forEach(function(elt) {
                    elastic.highlightElt(elt);
                });
            }
            , highlightElt: function(cde) {
                if (!cde.highlight) return;
                this.highlight = function(field1, field2, cde) {
                    if (cde.highlight[field1 + "." + field2]) {
                        cde.highlight[field1 + "." + field2].forEach(function(nameHighlight) {
                            var elements;
                            if (field1.indexOf(".") < 0) elements = cde[field1];
                            else elements = cde[field1.replace(/\..+$/,"")][field1.replace(/^.+\./,"")];
                            elements.forEach(function(nameCde, i){
                                if (nameCde[field2] === nameHighlight.replace(/<[^>]+>/gm, '')) {
                                    nameCde[field2] = nameHighlight;
                                    if (field2 === "designation" && i === 0) cde.highlight.primaryName = true;
                                }
                            });

                        });
                    }
                };
                this.highlightOne = function(field, cde) {
                    if (cde.highlight[field]) {
                        if (field.indexOf(".") < 0) {
                            if (cde.highlight[field][0].replace(/<strong>/g, "").replace(/<\/strong>/g, "")
                                    .substr(0, 50) === cde[field].substr(0, 50)) {
                                cde[field] = cde.highlight[field][0];
                            } else {
                                cde[field] = cde[field].substr(0, 50) + " [...] " +  cde.highlight[field][0];
                            }
                        }
                        else cde[field.replace(/\..+$/,"")][field.replace(/^.+\./,"")] = cde.highlight[field][0];
                    } else {
                        if (field.indexOf(".") < 0) {
                            cde[field] = cde[field].substr(0, 200);
                            if (cde[field].length > 199) cde[field] += "...";
                        }
                    }
                };
                this.highlightOne("stewardOrgCopy.name", cde);
                this.highlightOne("primaryNameCopy", cde);
                this.highlightOne("primaryDefinitionCopy", cde);
                this.setMatchedBy(cde);
            }
            , setMatchedBy: function(cde) {
                if (cde.highlight.primaryNameCopy) return;
                var field = null;
                var matched = Object.keys(cde.highlight)[0];
                if (matched === "naming.definition" || matched === "primaryDefinitionCopy") field = "Definition";
                if (matched.indexOf("classification.")>-1) field = "Classification";
                if (matched.indexOf(".concepts.")>-1) field = "Concepts";
                if (matched.substr(0,11) === "valueDomain") field = "Permissible Values";
                if (matched.substr(0,15) === "flatProperties") field = "Properties";
                if (matched === "naming.designation") field = "Alternative Name";
                if (matched  === "stewardOrgCopy.name") field = "Steward";
                if (matched  === "flatIds") field = "Identifier";
                cde.highlight.matchedBy = field;
            }
            , getExport: function(query, type, cb) {
                $http({
                    url: "/elasticSearchExport/" + type
                    , method: "POST"
                    , data: query
                    , transformResponse: function(a){return a;}
                }).then(function onSuccess(response) {
                    cb(null, response.data);
                }).catch(function onError(response) {
                    if (response.status === 503) cb("The server is busy processing similar request, please try again in a minute.");
                    else cb("An error occured. This issue has been reported.");
                });
            }
        };
    }]);