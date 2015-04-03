angular.module('ElasticSearchResource', ['ngResource'])
.factory('Elastic', function($http, userResource) {
    return {
        buildElasticQueryPre: function (scope) {
            var regStatuses = scope.registrationStatuses;
            if (!regStatuses) regStatuses = [];
            var regStatusOr = [];
            for (var i = 0; i < regStatuses.length; i++) {
                var t = regStatuses[i];
                if (t.selected === true) {
                    regStatusOr.push({term: {"registrationState.registrationStatus": t.name}});
                }
            }
            var filter = {and: []};
            if (regStatusOr.length > 0) {
                filter.and.push({or: regStatusOr});
            }      
            return filter;
        }
        , buildElasticQuerySettings: function(scope){
            var settings = {
                resultPerPage: scope.resultPerPage
                , searchTerm: scope.searchForm.ftsearch
                , isSiteAdmin: scope.isSiteAdmin()
                , userOrgs: userResource.userOrgs
                , selectedOrg: scope.classificationFilters[0].org
                , selectedOrgAlt: scope.classificationFilters[1].org
                , selectedElements: this.getSelectedElements(scope)
                , selectedElementsAlt: this.getSelectedElementsAlt(scope)
                , filter: scope.filter
                , currentPage: scope.searchForm.currentPage
            };
            return settings;
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
        , buildElasticQuery: function (settings, callback) {
            this.countFacetsDepthString = function (depth) {
                var fd = "classification";
                for (var j=1; j<=depth; j++) fd += ".elements";
                fd += ".name";
                return fd;
            };
            this.flattenSelection = function(upTo) {
                var flatSelection = "";
                for (var i = 0; i < settings.selectedElements.length && i < upTo; i++) {
                    if (flatSelection !== "") flatSelection = flatSelection + ";";
                    flatSelection = flatSelection + settings.selectedElements[i];
                }
                return flatSelection;
            };
            this.flattenSelectionAlt = function(upTo) {
                var flatSelectionAlt = "";
                if(settings.selectedElementsAlt) {
                    for (var i = 0; i < settings.selectedElementsAlt.length && i < upTo; i++) {
                        if (flatSelectionAlt !== "") flatSelectionAlt = flatSelectionAlt + ";";
                        flatSelectionAlt = flatSelectionAlt + settings.selectedElementsAlt[i];
                    }
                }
                return flatSelectionAlt;
            };
            this.escapeRegExp = function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            };

            var queryStuff = {size: this.getSize(settings)};
            var searchQ = settings.searchTerm;

            queryStuff.query =
            {
                bool: {
                    must_not: [{
                        term: {
                            "registrationState.registrationStatus": "Retired"
                        }
                    }]
                }
            };

            queryStuff.query.bool.must = [];

            var script = "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value";

            queryStuff.query.bool.must.push({
                dis_max: {
                    queries: [
                        {function_score: {script_score: {script: script}}}
                    ]
                }
            });

            if (searchQ !== undefined && searchQ !== "") {
                queryStuff.query.bool.must[0].dis_max.queries[0].function_score.query =
                    {
                        query_string: {
                            query: searchQ
                        }
                    };
                queryStuff.query.bool.must[0].dis_max.queries.push({function_score: {script_score: {script: script}}});
                queryStuff.query.bool.must[0].dis_max.queries[1].function_score.query =
                {
                    query_string: {
                        fields: ["naming.designation^5", "naming.definition^2"]
                        , query: searchQ
                    }
                };
                queryStuff.query.bool.must[0].dis_max.queries[1].function_score.boost = "2.5";
                if (searchQ.indexOf("\"") < 0) {
                    queryStuff.query.bool.must[0].dis_max.queries.push({function_score: { script_score: {script: script}}});
                    queryStuff.query.bool.must[0].dis_max.queries[2].function_score.query =
                    {
                        query_string: {
                            fields: ["naming.designation^5", "naming.definition^2"]
                            , query: "\"" + searchQ + "\"~4"
                        }
                    };
                    queryStuff.query.bool.must[0].dis_max.queries[1].function_score.boost = "2";
                }
            }
            
            if (settings.selectedOrg !== undefined) {
                queryStuff.query.bool.must.push({term: {"classification.stewardOrg.name": settings.selectedOrg}});
            }

            var queryBuilder = this;

            var flatSelection = queryBuilder.flattenSelection(1000);
            if (flatSelection !== "") {
                queryStuff.query.bool.must.push({term: {flatClassification: settings.selectedOrg + ";" + flatSelection}});
            }

            var flatSelectionAlt = queryBuilder.flattenSelectionAlt(1000);
            if (flatSelectionAlt !== "") {
                queryStuff.query.bool.must.push({term: {flatClassification: settings.selectedOrgAlt + ";" + flatSelectionAlt}});
            }

            queryStuff.aggregations = {
                lowRegStatusOrCurator_filter: {
                    "filter": {
                    },
                    aggs: {
                        orgs: {
                            terms: {
                                "field": "classification.stewardOrg.name",
                                "size": 40,
                                order: {
                                    "_term": "desc"
                                }
                            }
                        }
                    }
                },
                statuses: {
                    terms: {
                        field: "registrationState.registrationStatus"
                    }
                }
            };

            queryStuff.aggregations.statuses.aggregations = {
            };

            if (settings.selectedOrg !== undefined) {
                var flatClassification = {
                    terms: {
                        size: 500,
                        field: "flatClassification"
                    }
                };
                if (flatSelection === "") {
                    flatClassification.terms.include = settings.selectedOrg + ";[^;]+";
                } else {
                    flatClassification.terms.include = settings.selectedOrg + ';' + queryBuilder.escapeRegExp(flatSelection) + ";[^;]+";
                }
                queryStuff.aggregations.filteredFlatClassification = {
                    filter: {
                        //or: lowRegStatusOrCuratorFilter
                    }
                    , aggs: {
                        flatClassification: flatClassification
                    }
                };
            }

            if (settings.selectedOrgAlt !== undefined) {
                var flatClassificationAlt = {
                    terms: {
                        size: 500,
                        field: "flatClassification"
                    }
                };
                if (flatSelectionAlt === "") {
                    flatClassificationAlt.terms.include = settings.selectedOrgAlt + ";[^;]+";
                } else {
                    flatClassificationAlt.terms.include = settings.selectedOrgAlt + ';' + queryBuilder.escapeRegExp(flatSelectionAlt) + ";[^;]+";
                }
                queryStuff.aggregations.filteredFlatClassificationAlt = {
                    filter: {
                        //or: lowRegStatusOrCuratorFilter
                    }
                    , aggs: {
                        flatClassificationAlt: flatClassificationAlt
                    }
                };
            }


            if (settings.filter !== undefined) {
                if (settings.filter.and !== undefined) {
                    if (settings.filter.and.length === 0) {
                        delete settings.filter.and;
                    }
                }
                if (settings.filter.and === undefined) {
                    delete settings.filter;
                }
            }

            if (settings.filter !== undefined) {
                queryStuff.filter = settings.filter;
            }

            if (queryStuff.query.bool.must.length === 0) {
                delete queryStuff.query.bool.must;
            }

            var from = (settings.currentPage - 1) * settings.resultPerPage;
            queryStuff.from = from;

            queryStuff.highlight = {
                "order" : "score"
                , "pre_tags" : ["<strong>"]
                , "post_tags" : ["</strong>"]
                , "fields" : {
                    "stewardOrgCopy.name" : {}
                    , "primaryNameCopy": {}
                    , "primaryDefinitionCopy": {}
                    , "naming.designation": {}
                    , "naming.definition": {}
                    , "dataElementConcept.concepts.name": {}
                    , "dataElementConcept.concepts.origin": {}
                    , "dataElementConcept.concepts.originId": {}
                    , "property.concepts.name": {}
                    , "property.concepts.origin": {}
                    , "property.concepts.originId": {}
                    , "objectClass.concepts.name": {}
                    , "objectClass.concepts.origin": {}
                    , "objectClass.concepts.originId": {}
                    , "valueDomain.datatype": {}
                    , "flatProperties": {}
                    , "flatIds": {}
                    , "classification.stewardOrg.name": {}
                    , "classification.elements.name": {}
                    , "classification.elements.elements.name": {}
                    , "classification.elements.elements.elements.name": {}

                }
            };

            return callback({query: queryStuff});
        }
        , generalSearchQuery: function(query, type, cb) {          
            var elastic = this; 
            $http.post("/elasticSearch/" + type, query)
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
            var elastic = this;
            $http.post("/elasticSearchExport/" + type, query)
            .success(function (response) {
                cb(response);
            })
            .error(function(data, status, headers, config) {
                cb(response);
            });
        }
    };
});