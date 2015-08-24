angular.module('ElasticSearchResource', ['ngResource'])
.factory('Elastic', function($http, userResource, SearchSettings) {
    return {
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
                , selectedStatuses: regStatuses
                , visibleStatuses: SearchSettings.getUserDefaultStatuses()
                , searchToken: this.searchToken
            };
        }
        , getSelectedElements: function(scope) {
            return scope.classificationFilters[0].elements?scope.classificationFilters[0].elements:[];
        }
        , getSelectedElementsAlt: function(scope) {
            return scope.classificationFilters[0].elements?scope.classificationFilters[1].elements:[];
        }
        , getSize: function(settings) {
            return settings.resultPerPage?settings.resultPerPage:20;
        }
        , generalSearchQuery: function(settings, type, cb) {
            var elastic = this; 
            $http.post("/elasticSearch/" + type, settings)
                    .success(function (response) {
                        elastic.highlightResults(response.cdes);
                        cb(null, response);
                    })
                    .error(function(response) {
                        cb("Error");
                    });
        } 
        , highlightResults: function(cdes) {
            var elastic = this;
            cdes.forEach(function(cde) {
                elastic.highlightCde(cde);
            });
        }        
        , highlightCde: function(cde) {
            if (!cde.highlight) return;
            this.highlight = function(field1,field2, cde) {
                if (cde.highlight[field1+"."+field2]) {
                    cde.highlight[field1+"."+field2].forEach(function(nameHighlight) {
                        var elements;
                        if (field1.indexOf(".")<0) elements = cde[field1];
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
                    if (field.indexOf(".")<0) cde[field] = cde.highlight[field][0];
                    else cde[field.replace(/\..+$/,"")][field.replace(/^.+\./,"")] = cde.highlight[field][0];            
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
            $http.post("/elasticSearchExport/" + type, query)
            .success(function (response) {
                cb(response);
            })
            .error(function(data, status, headers, config) {
                cb();
            });
        }
    };
});