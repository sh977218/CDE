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
    $scope.selectedGroup = $scope.cache.get("selectedGroup");
    $scope.selectedSubGroup = $scope.cache.get("selectedSubGroup"); 
    $scope.totalItems = $scope.cache.get("totalItems");
    
    $scope.currentPage = $scope.cache.get("currentPage");
    if ($scope.currentPage === undefined) {
        $scope.currentPage = 1;
    }
    
    $scope.$watch('currentPage', function() {
        $scope.cache.put("currentPage", $scope.currentPage)
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
                
                $scope.groups = [];
                
                if ($scope.facets.groups !== undefined) {
                    $http.get("/org/" + $scope.selectedOrg).then(function(response) {
                        var org = response.data;
                        if (org.classifications) {
                            // Foreach conceptSystem in query.facets
                            for (var i = 0; i < $scope.facets.groups.terms.length; i++) {
                                var g = $scope.facets.groups.terms[i];
                                // Find conceptSystem in db.org.classifications
                                for (var j = 0; j < org.classifications.length; j++) {
                                    if (org.classifications[j].name === g.term) {
                                       var group = {name: g.term, concepts: []};
                                       // Add concepts from db.org.classifications.elements
                                       for (var m = 0; m < org.classifications[j].elements.length; m++) {
                                            for (var h=0; h<$scope.facets.concepts.terms.length; h++) {
                                                var c = $scope.facets.concepts.terms[h];
                                                if (org.classifications[j].elements[m].name===c.term) {
                                                    group.concepts.push(c);
                                                }                                               
                                            }
                                        } 
                                        $scope.groups.push(group);
                                    }
                                }
                            }
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

        queryStuff.query.bool.must.push({
            function_score: {
                boost_mode: "replace"
                , script_score: {
                    script: "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value"
//                    script: "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value))"
                }
            }
        });
        
       if (searchQ !== undefined && searchQ !== "") {
            queryStuff.query.bool.must[0].function_score.query =
                {
                    query_string: {
                        fields: ["_all", "naming.designation^3"]
                        , query: searchQ
                    }
                };
        }
               
        if ($scope.selectedOrg !== undefined) {
            queryStuff.query.bool.must.push({term: {"classification.stewardOrg.name": $scope.selectedOrg}});
        }
        
        if ($scope.selecteGroup !== undefined) {
            queryStuff.query.bool.must.push({term: {"classification.elements.name": $scope.selecteGroup.term}});
        }        

        if ($scope.selectedSubGroup !== undefined) {
            queryStuff.query.bool.must.push({term: {"classification.elements.elements.name": $scope.selectedSubGroup.term}});
        }

        queryStuff.facets = {
            orgs: {terms: {field: "classification.stewardOrg.name", size: 40, order: "term"}, facet_filter: {or: lowRegStatusOrCuratorFilter}}
            , statuses: {terms: {field: "registrationState.registrationStatus"}, facet_filter: {or: lowRegStatusOrCuratorFilter}}
        };    

        if ($scope.selectedOrg !== undefined) {
            queryStuff.facets.groups = {
                terms: {field: "classification.elements.name", size: 200}
                , facet_filter: {and: [{term: {"classification.stewardOrg.name": $scope.selectedOrg}}, {or: lowRegStatusOrCuratorFilter}]}
            }
            queryStuff.facets.concepts = {
                terms: {field: "classification.elements.elements.name", size: 300}
                , facet_filter: {and: [{
                    term: {"classification.stewardOrg.name": $scope.selectedOrg}
                }, {or: lowRegStatusOrCuratorFilter}]}
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
        delete $scope.selectedGroup;
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
            $scope.cacheOrgFilter(t.term);
            $scope.selectedOrg = t.term;
        } else {
            $scope.removeCacheOrgFilter();
            delete $scope.selectedOrg;
            delete $scope.selectedSubGroup;
            delete $scope.selectedGroup;            
        }  
        delete $scope.facets.groups;
        $scope.reload();
    };

    $scope.selectSubGroup = function(subG) {        
        if ($scope.selectedSubGroup === undefined) {
            $scope.cacheSubGroup(subG);
            $scope.selectedSubGroup = subG;
        } else {
            $scope.removeCacheSubGroup();
            delete $scope.selectedSubGroup;
        }        
        $scope.reload();
    };

    $scope.selectGroup = function(g) {        
        if ($scope.selectedGroup === undefined) {
            $scope.cacheGroup(g);
            $scope.selectedGroup = g;
        } else {
            $scope.removeCacheGroup();
            delete $scope.selectedGroup;
            delete $scope.selectedSubGroup;
        }        
    };     
}
