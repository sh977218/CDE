angular.module('resources')
.factory('Elastic', function($http) {
    return {
        buildElasticQueryPre: function (scope) {
            scope.filter = {and: []};
            var regStatusOr = [];
            for (var i = 0; i < scope.registrationStatuses.length; i++) {
                var t = scope.registrationStatuses[i];
                if (t.selected === true) {
                    regStatusOr.push({term: {"registrationState.registrationStatus": t.name}});
                }
            }
            if (regStatusOr.length > 0) {
                scope.filter.and.push({or: regStatusOr});
            }               
        }
        , buildElasticQuerySettings: function(scope){
            var settings = {
                resultPerPage: scope.resultPerPage
                , searchTerm: scope.searchForm.ftsearch
                , isSiteAdmin: scope.isSiteAdmin()
                , myOrgs: scope.myOrgs 
                , selectedOrg: scope.selectedOrg
                , selectedElements: this.getSelectedElements(scope)
                , filter: scope.filter
                , currentPage: scope.searchForm.currentPage
            };
            return settings;
        }
        , getSelectedElements: function(scope) {
            return scope.selectedElements?scope.selectedElements:[];
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
            var queryStuff = {size: this.getSize(settings)};
            var searchQ = settings.searchTerm;       

            queryStuff.query = 
            {   
                bool: {
                    must_not: [{
                        term: {
                            "registrationState.registrationStatus": "Retired"
                        }
                    },{
                        term: {
                            "registrationState.administrativeStatus": "retire"
                        }
                    },{
                        term: {
                            "archived": "true"
                        }
                    } 
                    ]
                }
           };

            if (!settings.isSiteAdmin) {
                var lowRegStatusOrCuratorFilter = [];
                lowRegStatusOrCuratorFilter.push({range: {"registrationState.registrationStatusSortOrder": {lte: 3}}});
                if (settings.myOrgs !== undefined) {
                     for (var i = 0; i < settings.myOrgs.length; i++) {
                         lowRegStatusOrCuratorFilter.push({term: {"stewardOrg.name": settings.myOrgs[i]}});
                     }
                }
                settings.filter.and.push({or: lowRegStatusOrCuratorFilter});
            }  
            
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
            for (var i=0; i<settings.selectedElements.length; i++) {
                var facetsDepth = queryBuilder.countFacetsDepthString(i+1);            
                var term = {term:{}};
                term.term[facetsDepth] = settings.selectedElements[i];
                queryStuff.query.bool.must.push(term);
            }


            queryStuff.facets = {
                orgs: {terms: {field: "classification.stewardOrg.name", size: 40, order: "term"}}
                , statuses: {terms: {field: "registrationState.registrationStatus"}}
            };
            if (!settings.isSiteAdmin) {
               queryStuff.facets.orgs.facet_filter = {or: lowRegStatusOrCuratorFilter};
               queryStuff.facets.statuses.facet_filter = {or: lowRegStatusOrCuratorFilter};
            }

            if (settings.selectedOrg !== undefined) {
                queryStuff.facets.elements = {
                    terms: {field: "classification.elements.name", size: 500}
                    , facet_filter: {and: [{term: {"classification.stewardOrg.name": settings.selectedOrg}}]}
                };
                if (!settings.isSiteAdmin) {
                    queryStuff.facets.elements.facet_filter.and.push({or: lowRegStatusOrCuratorFilter});
                }

                for (var i=2; i<=settings.selectedElements.length+1; i++) {   
                    var fd = queryBuilder.countFacetsDepthString(i);
                    queryStuff.facets["elements"+i] = {
                        terms: {field: fd, size: 500}
                        , facet_filter: {and: [{term: {"classification.stewardOrg.name": settings.selectedOrg}}]}
                    };
                    if (!settings.isSiteAdmin) {
                        queryStuff.facets["elements" + i].facet_filter.and.push({or: lowRegStatusOrCuratorFilter});
                    }
                    for (var j=0; j<settings.selectedElements.length; j++) {
                        fd = queryBuilder.countFacetsDepthString(j+1);
                        var f = {term: {}};
                        f.term[fd] = settings.selectedElements[j];
                        queryStuff.facets["elements"+i].facet_filter.and.push(f);
                    }
                }            
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
                , "fields" : {
                    "*" : {
                        "pre_tags" : ["<strong>"]
                        , "post_tags" : ["</strong>"]
                        , "content": {"fragment_size" : 1000}
                    }
                }
            };
            
            return callback({query: queryStuff});
        }              
        , generalSearchQuery: function(query, cb) {          
            var elastic = this; 
            $http.post("/elasticSearch", query).then(function (response) {
                elastic.highlightResults(response.data.cdes);
                cb(response.data);
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
                        if (field1.indexOf(".")<0) var elements = cde[field1];
                        else var elements = cde[field1.replace(/\..+$/,"")][field1.replace(/^.+\./,"")];
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
            //this.highlight("valueDomain.permissibleValues","valueMeaningName", cde);
            //this.highlight("valueDomain.permissibleValues","permissibleValue", cde);
            //this.highlight("valueDomain.permissibleValues","valueMeaningCode", cde);
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
            if (matched.indexOf("classificationCopy.")>-1) field = "Classification";
            if (matched.indexOf(".concepts.")>-1) field = "Concepts";
            if (matched.substr(0,11) === "valueDomain") field = "Permissible Values";
            if (matched.substr(0,10) === "properties") field = "Properties";
            if (matched === "naming.designation") field = "Alternative Name";
            if (matched  === "stewardOrgCopy.name") field = "Steward";
            if (matched  === "ids.id") field = "Identifier";
            cde.highlight.matchedBy = field;
        }
    };
});