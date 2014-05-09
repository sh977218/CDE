function DEListCtrl($scope, $http, $modal, $cacheFactory) {
    $scope.setActiveMenu('LISTCDE');

    $scope.initCache(); 
    
    $scope.openAllModel = $scope.cache.get("openAll");
    
    $scope.registrationStatuses = $scope.cache.get("registrationStatuses");
    if ($scope.registrationStatuses === undefined) {
        $scope.registrationStatuses = [
            {name: 'Preferred Standard'}
            , {name: 'Standard'}
            , {name: 'Qualified'}
            , {name: 'Recorded'}
            , {name: 'Candidate'}
            , {name: 'Incomplete'}
        ];
    }
        
    $scope.resultPerPage = 20;

    $scope.ftsearch = $scope.cache.get("ftsearch");

    $scope.selectedOrg = $scope.cache.get("selectedOrg");
    $scope.selectedElements = $scope.cache.get("selectedElements");
    if (!$scope.selectedElements) {
        $scope.selectedElements = [];
    } 
    $scope.totalItems = $scope.cache.get("totalItems");
    
    $scope.currentPage = $scope.cache.get("currentPage");
    if ($scope.currentPage === undefined) {
        $scope.currentPage = 1;
    }
    
    $scope.$watch('currentPage', function() {
        $scope.cache.put("currentPage", $scope.currentPage);
        $scope.reload();
    });


    
    $scope.addStatusFilter = function(t) {
        t.selected = !t.selected;
        $scope.cache.put("registrationStatuses", $scope.registrationStatuses);
        $scope.reload();
    };
    
    $scope.reload = function() {
        $scope.buildElasticQuery(function(query) {
            $http.post("/elasticSearch", query).then(function (response) {
                var result = response.data;
                $scope.numPages = Math.ceil(result.totalNumber / $scope.resultPerPage); 
                $scope.cdes = result.cdes;
                $scope.openAll();
                $scope.totalItems = result.totalNumber;
                $scope.cache.put("totalItems", $scope.totalItems);
                $scope.facets = result.facets;
                
                for (var j = 0; j < $scope.registrationStatuses.length; j++) {
                   $scope.registrationStatuses[j].count = 0; 
                }
                if ($scope.facets.statuses !== undefined) {
                    for (var i = 0; i < $scope.facets.statuses.terms.length; i++) {
                        for (var j = 0; j < $scope.registrationStatuses.length; j++) {
                            if ($scope.facets.statuses.terms[i].term === $scope.registrationStatuses[j].name.toLowerCase()) {
                                $scope.registrationStatuses[j].count = $scope.facets.statuses.terms[i].count;
                            }
                        }
                    }
                }    
                
                $scope.classifications = {elements: []};

                if ($scope.facets.elements !== undefined) {
                    $http.get("/org/" + $scope.selectedOrg).then(function(response) {
                        var org = response.data;
                        if (org.classifications) {
                            $scope.facets.elements.terms.forEach(function (e) {
                                // Find conceptSystem in db.org.classifications
                                org.classifications.forEach(function(oe) {                                    
                                    if (oe.name === e.term) {
                                       var elt = {name: e.term, count: e.count, elements: [], level: 0};
                                       if ($scope.facets.elements2 !== undefined) {
                                            $scope.facets.elements2.terms.forEach(function (e2) {
                                                oe.elements.forEach(function (oe2) {
                                                    if (oe2.name === e2.term) {
                                                        var elt2 = {name: e2.term, count: e2.count, elements: [], level: 1};
                                                        if ($scope.facets.elements3 !== undefined) {
                                                              $scope.facets.elements3.terms.forEach(function (e3) {
                                                                  if (oe2.elements) {
                                                                    oe2.elements.forEach(function (oe3) {
                                                                        if (oe3.name === e3.term) {
                                                                            var elt3 = {name: e3.term, count: e3.count, elements: [], level: 2};

                                                                            elt2.elements.push(elt3);
                                                                        }
                                                                    });
                                                                  }
                                                              });
                                                          }
                                                        elt.elements.push(elt2);
                                                    }
                                                }); 
                                            });
                                        }
                                        $scope.classifications.elements.push(elt);
                                    }
                                });
                            });
                        }
                    });
                }
             });
        });  
    };

    $scope.buildElasticQuery = function (callback) {
        var queryStuff = {size: $scope.resultPerPage};
        var searchQ = $scope.ftsearch;
        
        $scope.filter = {and: []};
        var regStatusOr = [];
        for (var i = 0; i < $scope.registrationStatuses.length; i++) {
            var t = $scope.registrationStatuses[i];
            if (t.selected === true) {
                regStatusOr.push({term: {"registrationState.registrationStatus": t.name.toLowerCase()}});
            }
        }
        if (regStatusOr.length > 0) {
            $scope.filter.and.push({or: regStatusOr});
        }       

        queryStuff.query = 
        {   
            bool: {
                must_not: {
                    term: {
                        "registrationState.registrationStatus": "retired"
                    }
                }
            }
       };
       
       var lowRegStatusOrCuratorFilter = [];
       lowRegStatusOrCuratorFilter.push({range: {"registrationState.registrationStatusSortOrder": {lte: 2}}});
       if ($scope.myOrgs !== undefined) {
            for (var i = 0; i < $scope.myOrgs.length; i++) {
                lowRegStatusOrCuratorFilter.push({term: {"stewardOrg.name": $scope.myOrgs[i]}});
            }
       }
       $scope.filter.and.push({or: lowRegStatusOrCuratorFilter});
       
       queryStuff.query.bool.must = [];
       
       var script = "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value";
       
       queryStuff.query.bool.must.push({
          dis_max: {
              queries: [
                  {function_score: {boost_mode: "replace", script_score: {script: script}}}
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
            queryStuff.query.bool.must[0].dis_max.queries.push({function_score: {boost_mode: "replace", script_score: {script: script}}});
            queryStuff.query.bool.must[0].dis_max.queries[1].function_score.query = 
            {
                query_string: {
                    fields: ["naming.designation^5", "naming.definition^2"]
                    , query: searchQ
                }
            };
            queryStuff.query.bool.must[0].dis_max.queries[1].function_score.boost = "2.5";
        }
               
        if ($scope.selectedOrg !== undefined) {
            queryStuff.query.bool.must.push({term: {"classification.stewardOrg.name": $scope.selectedOrg}});
        }
        
        if ($scope.selectedElements.length > 0) {
            queryStuff.query.bool.must.push({term: {"classification.elements.name": $scope.selectedElements[0]}});
            if ($scope.selectedElements.length > 1) {
                queryStuff.query.bool.must.push({term: {"classification.elements.elements.name": $scope.selectedElements[1]}});
                if ($scope.selectedElements.length > 2) {
                    queryStuff.query.bool.must.push({term: {"classification.elements.elements.elements.name": $scope.selectedElements[2]}});
                }
            }
        }


        queryStuff.facets = {
            orgs: {terms: {field: "classification.stewardOrg.name", size: 40, order: "term"}, facet_filter: {or: lowRegStatusOrCuratorFilter}}
            , statuses: {terms: {field: "registrationState.registrationStatus"}, facet_filter: {or: lowRegStatusOrCuratorFilter}}
        };    

        if ($scope.selectedOrg !== undefined) {
            queryStuff.facets.elements = {
                terms: {field: "classification.elements.name", size: 200}
                , facet_filter: {and: [{term: {"classification.stewardOrg.name": $scope.selectedOrg}}, {or: lowRegStatusOrCuratorFilter}]}
            };
            if ($scope.selectedElements.length > 0) {
                queryStuff.facets.elements2 = {
                    terms: {field: "classification.elements.elements.name", size: 200}
                    , facet_filter: {and: [
                            {term: {"classification.stewardOrg.name": $scope.selectedOrg}}
                            , {term: {"classification.elements.name": $scope.selectedElements[0]}}
                            , {or: lowRegStatusOrCuratorFilter}]}
                };
                if ($scope.selectedElements.length > 1) {
                    queryStuff.facets.elements3 = {
                        terms: {field: "classification.elements.elements.elements.name", size: 200}
                        , facet_filter: {and: [
                                {term: {"classification.stewardOrg.name": $scope.selectedOrg}}
                                , {term: {"classification.elements.name": $scope.selectedElements[0]}}
                                , {term: {"classification.elements.elements.name": $scope.selectedElements[1]}}
                                , {or: lowRegStatusOrCuratorFilter}]}
                    };
                }
            }
        }

        if ($scope.filter !== undefined) {
            if ($scope.filter.and !== undefined) {
                if ($scope.filter.and.length === 0) {
                    delete $scope.filter.and;
                } 
            }
            if ($scope.filter.and === undefined) {
                delete $scope.filter;
            }
        }

        if ($scope.filter !== undefined) {
            queryStuff.filter = $scope.filter;
        }
        
        if (queryStuff.query.bool.must.length === 0) {
            delete queryStuff.query.bool.must;
        }

        var from = ($scope.currentPage - 1) * $scope.resultPerPage;
        queryStuff.from = from;
        return callback({query: queryStuff});
    };

    $scope.resetSearch = function() {
        delete $scope.facets;
        $scope.filter = []; 
        delete $scope.ftsearch;
        delete $scope.selectedOrg;
        delete $scope.selectedElements;
        delete $scope.selectedSubGroup;
        $scope.cache.removeAll();
        $scope.reload();
    };

    $scope.search = function() {
        $scope.cache.put("ftsearch", $scope.ftsearch);
        $scope.reload();
    };
    
    $scope.isAllowed = function (cde) {
        return false;
    };
    
    $scope.openAddToForm = function (cde) {
        $modal.open({
          templateUrl: 'addToFormModalContent.html',
          controller: AddToFormModalCtrl,
          resolve: {
              cde: function() {
                  return cde;
              }
          }
        });
    };
    
    $scope.isDefaultAttachment = function (item) {
      return item.isDefault;  
    };
    
    $scope.openAll = function() {
        for (var i = 0; i < $scope.cdes.length; i++) {
            $scope.cdes[i].isOpen = $scope.openAllModel;
        }
        $scope.cache.put("openAll", $scope.openAllModel);
    };
    
    $scope.addOrgFilter = function(t) {               
        if ($scope.selectedOrg === undefined) {
//            $scope.cacheOrgFilter(t.term);
            $scope.selectedOrg = t.term;
        } else {
            $scope.removeCacheOrgFilter();
            delete $scope.selectedOrg;
//            delete $scope.selectedSubGroup;
            delete $scope.selectedElements;            
        }  
        delete $scope.facets.groups;
        $scope.reload();
    };

    $scope.selectElement = function(e) {        
        if ($scope.selectedElements === undefined) {
            $scope.selectedElements = [];
            $scope.selectedElements.push(e.name);
        } else {
            var i = $scope.selectedElements.indexOf(e.name);
            if (i > -1) {
                $scope.selectedElements.length = i;
            } else {
                $scope.selectedElements.push(e.name);
            }
        }
        $scope.cache.put("selectedElements", $scope.selectedElements);
        $scope.reload();
    };     
}
