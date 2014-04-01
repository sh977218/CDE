function MainCtrl($scope, Myself, $http, $location, $anchorScroll) {
    $scope.loadUser = function(callback) {
        Myself.get(function(u) {
            $scope.user = u;
            $scope.setMyOrgs(); 
            $scope.loadBoards();
            callback();
        });
    };
    
    $scope.boards = [];
    $scope.loadBoards = function() {
        if ($scope.user && $scope.user._id) {
            $http.get("/boards/" + $scope.user._id).then(function (response) {
                $scope.boards = response.data;
            }); 
        }        
    };

    $scope.loadUser(function(){});    
    
    $scope.isOrgCurator = function() {        
        return $scope.isOrgAdmin() || ($scope.user && ($scope.user.orgCurator && $scope.user.orgCurator.length > 0));  
    };
    
    $scope.isOrgAdmin = function() {
        return $scope.user && (($scope.user.siteAdmin === true) || ($scope.user.orgAdmin && $scope.user.orgAdmin.length > 0));  
    };
    
    $scope.isSiteAdmin = function() {
        return $scope.user.siteAdmin;
    };
    
    $scope.registrationStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Standard', 'Preferred Standard', 'Retired'];

    $scope.setMyOrgs = function() {
        if ($scope.user && $scope.user.orgAdmin) {
            // clone orgAdmin array
            $scope.myOrgs = $scope.user.orgAdmin.slice(0);
            for (var i = 0; i < $scope.user.orgCurator.length; i++) {
                if ($scope.myOrgs.indexOf($scope.user.orgCurator[i]) < 0) {
                    $scope.myOrgs.push($scope.user.orgCurator[i]);
                }
            }
        }
    };
    
    $scope.compareCart = [];
    $scope.addToCompareCart = function(cdeId) {
        if ($scope.compareCart.length < 2) {
            $scope.compareCart.push(cdeId);
        }
    };

    $scope.showCompareButton = function(cde) {
        return $scope.compareCart.length < 2 &&
                $scope.compareCart.indexOf(cde._id) < 0;
    };
    
    // @TODO
    // Is there a more elegant way to do this?
    $scope.setActiveMenu = function(key) {
        $scope.menuHome = '';
        $scope.menuForm = '';
        $scope.menuLogin = '';
        $scope.menuCart = '';
        $scope.menuIntRev = '';
        $scope.menuNlmRev = '';
        $scope.menuAccount = '';
        $scope.menuCreate = '';
        $scope.menuMyBoards = '';
        $scope.menuBoardList = '';
        $scope.menuCompare = '';
        if (key === 'LISTCDE') {
            $scope.menuHome = 'active';
        } else if (key === 'LOGIN') {
            $scope.menuLogin = 'active';
        } else if (key === 'LISTFORMS') {
            $scope.menuForm = 'active';
        } else if (key === 'CART') {
            $scope.menuCart = 'active';
        } else if (key === 'INTREV') {
            $scope.menuIntRev = 'active';
        } else if (key === 'NLMREV') {
            $scope.menuNlmRev = 'active';
        } else if (key === 'ACCOUNT') {
            $scope.menuAccount = 'active';
        } else if (key === 'CREATECDE') {
            $scope.menuCreate = 'active';
        } else if (key === 'MYBOARDS') {
            $scope.menuMyBoards = 'active';
        } else if (key === 'BOARDLIST') {
            $scope.menuBoardList = 'active';
        } else if (key === 'COMPARE') {
            $scope.menuCompare = 'active';
        }
    };

    $scope.scrollTo = function(id) {
        var old = $location.hash();
        $location.hash(id);
        $anchorScroll();
        //reset to old to keep any additional routing logic from kicking in
        $location.hash(old);
    };
}

function ProfileCtrl($scope, ViewingHistory) {
    $scope.viewingHistory = [];
                
    ViewingHistory.getCdes({start: 0}, function(cdes) {
        $scope.viewingHistory = cdes;
    });
}

function CompareCtrl($scope, DataElement) {
    $scope.setActiveMenu('COMPARE');
    
    $scope.detailedView = true;
    $scope.cdes = [];
    
    if ($scope.compareCart.length === 2) {
        for (var i = 0; i < $scope.compareCart.length; i++) {
            DataElement.get({deId: $scope.compareCart[i]}, function (de) {
                $scope.cdes.push(de);
                if ($scope.cdes.length === 2) {
                    $scope.comparePvs($scope.cdes[1].valueDomain.permissibleValues, $scope.cdes[0].valueDomain.permissibleValues);
                    $scope.comparePvs($scope.cdes[0].valueDomain.permissibleValues, $scope.cdes[1].valueDomain.permissibleValues);
                }
            });
        } 
    }
        
    function lowerCompare(item1, item2) {
        if (item1 === undefined && item2 === undefined) {
            return true;
        } else if (item1 === undefined || item2 === undefined) {
            return false;
        } else {
            return item1.toLowerCase() === item2.toLowerCase();
        }
    }    
        
    $scope.isPvInList = function(pv, list, callback) {
        for (var i = 0; i < list.length; i++) {
            if (lowerCompare(pv.permissibleValue, list[i].permissibleValue) &&
                pv.valueMeaningCode === list[i].valueMeaningCode && 
                pv.codeSystemName === list[i].codeSystemName &&
                lowerCompare(pv.valueMeaningName, list[i].valueMeaningName)) {
                    return callback(true);
            }
        }
        return callback(false);
    };
    
    $scope.comparePvs = function(list1, list2) {
        for (var i = 0; i < list1.length; i++) {
           $scope.isPvInList(list1[i], list2, function(wellIsIt) {
                list1[i].isValid = wellIsIt;
           });
        }
    };
    
};

function BoardListCtrl($scope, BoardSearch) {
    $scope.setActiveMenu('BOARDLIST');
    
    $scope.search = {name: ""};
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.boards = [];

    $scope.reload = function() {
        var newfrom = ($scope.currentPage - 1) * $scope.pageSize;
        var result = BoardSearch.get({from: newfrom, search: JSON.stringify($scope.search)}, function () {
           $scope.numPages = result.pages; 
           $scope.boards = result.boards;
           $scope.totalItems = result.totalNumber;
        });
    } ;  
    
}

function BoardViewCtrl($scope, $routeParams, $http) {
    $scope.setActiveMenu('MYBOARDS');

    $scope.currentPage = 1;
    $scope.cdes = [];
        
    $scope.$watch('currentPage', function() {
        $scope.reload();
    });

    $scope.reload = function() {
        $http.get("/board/" + $routeParams.boardId + "/" + (($scope.currentPage-1) * 20)).then(function(response) {
            $scope.cdes = [];
            $scope.board = response.data.board;
            $scope.totalItems = response.data.totalItems;
            $scope.numPages = $scope.totalItems / 20;
            var pins = $scope.board.pins;
            var respCdes = response.data.cdes;
            for (var i = 0; i < pins.length; i++) {
                for (var j = 0; j < respCdes.length; j++) {
                    if (pins[i].deUuid === respCdes[j].uuid) {
                        pins[i].cde = respCdes[j];                    
                        $scope.cdes.push(respCdes[j]);
                    }
                }
            }
        });
    }; 
        
    $scope.unpin = function(pin) {
        $http.delete("/pincde/" + pin._id + "/" + $scope.board._id).then(function(response) {
            $scope.reload();
        });
    };
    
    $scope.reload();
    
}

function MyBoardsCtrl($scope, $modal, $http, $timeout) {
    $scope.setActiveMenu('MYBOARDS');
    
    $scope.removeBoard = function(index) {
        $http.delete("/board/" + $scope.boards[index]._id).then(function (response) {
            $scope.boards.splice(index, 1);
        });
    };    
    
    $scope.cancelSave = function(board) {
        delete board.editMode;
    };
    
    $scope.changeStatus = function(index) {
        var board = $scope.boards[index];
        if (board.shareStatus === "Private") {
            board.shareStatus = "Public";
        } else {
            board.shareStatus = "Private";
        }
        $scope.save(board);
        $scope.showChangeStatus = false;
    };
    
    $scope.save = function(board) {
        delete board.editMode; 
        $http.post("/board", board).success(function(response) {
            $scope.message = "Saved";
            $timeout(function() {
                delete $scope.message;
            }, 3000);

            $scope.loadBoards();
        });
    };
        
    $scope.openNewBoard = function (cde) {
        var modalInstance = $modal.open({
          templateUrl: 'newBoardModalContent.html',
          controller: NewBoardModalCtrl,
          resolve: {
          }
        });
        modalInstance.result.then(function() {
           $scope.loadBoards(); 
        });
    };
}

function NewBoardModalCtrl($scope, $modalInstance, $location, Board) {
    $scope.newBoard = {};
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.okCreate = function() {
        $scope.newBoard.shareStatus = "Private";
        Board.save($scope.newBoard, function(cde) {
            $location.path('#/myboards');        
        });
        $modalInstance.close();
    };
}

function AccountManagementCtrl($scope, $http, AccountManagement) {
    $scope.setActiveMenu('ACCOUNT');
    $scope.admin = {};
    $scope.newOrg = {};
    $scope.orgAdmin = {};
    $scope.orgCurator = {};
    $scope.admin = {};
    $scope.curator = {};
        
    $scope.getSiteAdmins = function() {
        return $http.get("/siteAdmins").then(function(response) {
            return response.data;
        });
    };
    $scope.siteAdmins = $scope.getSiteAdmins();

    $scope.getOrgs = function() {
        return $http.get("/managedOrgs").then(function(response) {
            return response.data.orgs;
        });
    };
    $scope.orgs = $scope.getOrgs(); 

    $scope.getOrgAdmins = function() {
        return $http.get("/orgAdmins").then(function(response) {
            return response.data.orgs;
        });
    };
    $scope.orgAdmins = $scope.getOrgAdmins(); 

    
    $scope.getMyOrgAdmins = function() {
        return $http.get("/myOrgsAdmins").then(function(response) {
            return response.data.orgs;
        });
    };
    $scope.myOrgAdmins = $scope.getMyOrgAdmins();

    $scope.getOrgCurators = function() {
        return $http.get("/orgcurators").then(function(response) {
            return response.data.orgs;
        });
    };
    $scope.orgCurators = $scope.getOrgCurators(); 
    
    $scope.addSiteAdmin = function() {
        AccountManagement.addSiteAdmin({
            username: $scope.admin.username
            },
            function(res) {
                  $scope.message = res;
                  $scope.siteAdmins = $scope.getSiteAdmins();
            }
        );
        $scope.admin.username = "";
    };
    
    $scope.removeSiteAdmin = function(byId) {
       AccountManagement.removeSiteAdmin({
            id: byId
            },
            function(res) {
                  $scope.message = res;
                  $scope.siteAdmins = $scope.getSiteAdmins();
            }
        );
    };
    
    $scope.addOrgAdmin = function() {
        AccountManagement.addOrgAdmin({
            username: $scope.orgAdmin.username
            , org: $scope.admin.orgName
            },
            function(res) {
                  $scope.message = res;
                  $scope.orgAdmins = $scope.getOrgAdmins();
                  $scope.myOrgAdmins = $scope.getMyOrgAdmins();
            }
        );
        $scope.orgAdmin.username = "";
    };

    $scope.removeOrgAdmin = function(orgName, userId) {
        AccountManagement.removeOrgAdmin({
            orgName: orgName
            , userId: userId
            },
            function (res) {
                $scope.message = res;
                $scope.orgAdmins = $scope.getOrgAdmins();
                $scope.myOrgAdmins = $scope.getMyOrgAdmins();
            }
        
        );
    };

    $scope.addOrgCurator = function() {
        AccountManagement.addOrgCurator({
            username: $scope.orgCurator.username
            , org: $scope.curator.orgName
            },
            function(res) {
                  $scope.message = res;
                  $scope.orgCurators = $scope.getOrgCurators(); 
            }
        );
        $scope.orgCurator.username = "";
    };
        
    $scope.removeOrgCurator = function(orgName, userId) {
        AccountManagement.removeOrgCurator({
            orgName: orgName
            , userId: userId
            },
            function (res) {
                $scope.message = res;
                $scope.orgCurators = $scope.getOrgCurators(); 
            }
        
        );
    };

    $scope.addOrg = function() {
        AccountManagement.addOrg({
            name: $scope.newOrg.name
            },
            function(res) {
                  $scope.message = res;
                  $scope.orgs = $scope.getOrgs();
            }
        );
        $scope.newOrg.name = "";
    };

    $scope.removeOrg = function(byId) {
       AccountManagement.removeOrg({
            id: byId
            },
            function(res) {
                  $scope.message = res;
                  $scope.orgs = $scope.getOrgs();
            }
        );
    };     
}

function AuthCtrl($scope, Auth, $window) {
    $scope.setActiveMenu('LOGIN');
    $scope.login = function() {
        Auth.login({
                username: $scope.username,
                password: $scope.password
            },
            function(res) {
                if (res === "OK") {
                    $window.location.href = "/";
                } else {
                    $scope.message = res;
                }
              },
            function(err) {
                $scope.message = "Failed to login";
            });
    };
}

function SelectBoardModalCtrl($scope, $modalInstance, boards) {
    $scope.boards = boards;

    $scope.ok = function (board) {
      $modalInstance.close(board);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
}

function DEListCtrl($scope, $http, $timeout, $modal, $location) {
    $scope.setActiveMenu('LISTCDE');
    
    $scope.currentPage = 1;
    $scope.resultPerPage = 20;

    $scope.search = {name: ""};
    $scope.filter = [];
    $scope.uniqueOrg = false;
    
    $scope.openPinModal = function (cde) {
        var modalInstance = $modal.open({
          templateUrl: 'selectBoardModalContent.html',
          controller: SelectBoardModalCtrl,
          resolve: {
            boards: function () {
              return $scope.boards;
            }
          }
        });

        modalInstance.result.then(function (selectedBoard) {
            $http.put("/pincde/" + cde.uuid + "/" + selectedBoard._id).then(function(response) {
                $scope.message = response.data;
                $timeout(function() {
                    delete $scope.message;
                }, 3000);
            });
        }, function () {
        });
    };
        
    $scope.view = function(cde) {
        $location.url("deview?cdeId=" + cde._id);
    };
    
    $scope.setPage = function (pageNo) {
      $scope.currentPage = pageNo;
    };       

    $scope.previous = function () {
        $scope.currentPage--;
    };

    $scope.next = function () {
        $scope.currentPage++;
    };
    
    $scope.$watch('currentPage', function() {
        $scope.reload();
    });
    
    $scope.addOrgFilter = function(t) {
        if ($scope.selectedOrg === undefined) {
            $scope.selectedOrg = t.term;
        } else {
            delete $scope.selectedOrg;
        }
        delete $scope.facets.groups;
        $scope.facetSearch();
    };

    $scope.selectSubGroup = function(subG, system) {
        subG.selected = !subG.selected;
        subG.conceptSystem = system;
        $scope.facetSearch();
    };

    $scope.openGroup = function(g) {
        g.selected = !g.selected;
    };
    
    $scope.addFilter = function(t) {
        t.selected = !t.selected;
        $scope.facetSearch();
    };
    
    $scope.facetSearch = function() {
        $scope.filter = {and: []};
        var regStatusOr = [];
  
        if ($scope.facets !== undefined) {
            if ($scope.selectedOrg !== undefined) {
                $scope.filter.and.push({term: {"classification.stewardOrg.name": $scope.selectedOrg}});
            }
            
            if ($scope.facets.groups) {
                for (var i = 0; i < $scope.facets.groups.length; i++) {
                    for (var j = 0; j < $scope.facets.groups[i].concepts.length; j++) {
                        var t = $scope.facets.groups[i].concepts[j];
                        if (t.selected === true) {
                            $scope.filter.and.push({term: {"classification.concept": t.term}});
                        }
                    }
                }
            }
            
            if ($scope.facets.statuses !== undefined) {
                for (var i = 0; i < $scope.facets.statuses.terms.length; i++) {
                    var t = $scope.facets.statuses.terms[i];
                    if (t.selected === true) {
                        regStatusOr.push({term: {"registrationState.registrationStatus": t.term}});
                    }
                }
            }
            if (regStatusOr.length > 0) {
                $scope.filter.and.push({or: regStatusOr});
            }
        }

        $scope.buildElasticQuery(function(query) {
            $http.post("/elasticSearch", query).then(function (response) {
                var result = response.data;
                $scope.numPages = Math.ceil(result.totalNumber / $scope.resultPerPage); 
                $scope.cdes = result.cdes;
                $scope.totalItems = result.totalNumber;
                $scope.facets = result.facets;
                
                for (var i = 0; i < regStatusOr.length; i++) {
                    if (regStatusOr[i].term['registrationState.registrationStatus'] !== undefined) {
                        for (var j = 0; j < $scope.facets.statuses.terms.length; j++) {
                            if ($scope.facets.statuses.terms[j].term === regStatusOr[i].term['registrationState.registrationStatus']) {
                                $scope.facets.statuses.terms[j].selected = true;
                            }
                        }
                    }
                }

                
                if ($scope.facets.classification !== undefined) {
                     $http.get("/org/" + $scope.selectedOrg).then(function(response) {
                         var org = response.data;
                         $scope.facets.groups = [];
                         if (org.classifications) {
                            for (var i = 0; i < org.classifications.length; i++) {
                                var currentOrgClassif = org.classifications[i];
                                var sysFound = false;
                                for (var j = 0; j < $scope.facets.groups.length; j++) {
                                    if ($scope.facets.groups[j].conceptSystem === currentOrgClassif.conceptSystem) {
                                        sysFound = true;
                                    }
                                }
                                if (sysFound == false) {
                                    var newGroup = {conceptSystem: currentOrgClassif.conceptSystem, concepts: []};
                                    for (var j = 0; j < org.classifications.length; j++) {
                                        if (org.classifications[j].conceptSystem == currentOrgClassif.conceptSystem) {
                                            var groupConcept = {term: org.classifications[j].concept};
                                            for (var h = 0; h < $scope.facets.classification.terms.length; h++) {
                                                if ($scope.facets.classification.terms[h].term == groupConcept.term) {
                                                    groupConcept.count = $scope.facets.classification.terms[h].count;
                                                }
                                            }
                                            if (groupConcept.count) {
                                                newGroup.concepts.push(groupConcept);
                                            }
                                        }
                                    }
                                    if (newGroup.concepts.length > 0) {
                                        $scope.facets.groups.push(newGroup);    
                                    }
                                 }
                            }
                        }
                         for (var i = 0; i < $scope.filter.and.length; i++) {
                             if ($scope.filter.and[i].term !== undefined) {
                                if ($scope.filter.and[i].term['classification.stewardOrg.name'] !== undefined) {
                                    for (var j = 0; j < $scope.facets.orgs.terms.length; j++) {
                                        if ($scope.facets.orgs.terms[j].term === $scope.filter.and[i].term['classification.stewardOrg.name']) {
                                            $scope.facets.orgs.terms[j].selected = true;
                                        }
                                    }
                                }
                                if ($scope.filter.and[i].term['classification.concept'] !== undefined) {
                                    for (var j = 0; j < $scope.facets.groups.length; j++) {
                                        for (var h = 0; h < $scope.facets.groups[j].concepts.length; h++) {
                                            if ($scope.filter.and[i].term['classification.concept'] === $scope.facets.groups[j].concepts[h].term) {
                                                $scope.facets.groups[j].selected = true;
                                                $scope.facets.groups[j].concepts[h].selected = true;
                                            }
                                        }
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

        if (searchQ !== undefined && searchQ !== "") {
            queryStuff.query = 
                {   
                    bool: {
                        should: {
                        function_score: {
                            boost_mode: "replace"
                            , script_score: {
                                script: "_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)"
                            }
                            , query: {
                                query_string: {
                                    fields: ["_all", "naming.designation^3"]
                                    , query: searchQ
                                }
                            }
                        }
                        }
                        , must_not: {
                            term: {
                                "registrationState.registrationStatus": "retired"
                            }
                        }
                    }
               };
        } 

        queryStuff.facets = {
            orgs: {terms: {field: "classification.stewardOrg.name", size: 40, order: "term"}}
            , statuses: {terms: {field: "registrationState.registrationStatus"}}
        };    

        if ($scope.filter !== undefined) {
            if ($scope.filter.and !== undefined) {
                if ($scope.filter.and.length === 0) {
                    delete $scope.filter.and;
                } else {
                    for (var i = 0; i < $scope.filter.and.length; i++) {
                         if ($scope.filter.and[i].term !== undefined && $scope.filter.and[i].term['classification.stewardOrg.name'] !== undefined) {
                             queryStuff.facets.classification = {
                                 terms: {field: "classification.concept", size: 300}
                                 , facet_filter: {term: {"classification.stewardOrg.name": $scope.filter.and[i].term['classification.stewardOrg.name']}}
                             };
                         }  
                     }
                }
            }
            if ($scope.filter.and === undefined) {
                delete $scope.filter;
            }
        }

        if ($scope.filter !== undefined) {
            queryStuff.filter = $scope.filter;
        }

        var from = ($scope.currentPage - 1) * $scope.resultPerPage;
        queryStuff.from = from;
        return callback({query: queryStuff});
    };

    $scope.search = function() {
        delete $scope.facets;
        $scope.filter = [];
        $scope.reload();
    };

    $scope.reload = function() {        
        $scope.buildElasticQuery(function(query) {
            $http.post("/elasticSearch", query).then(function (response) {
               var result = response.data;
               $scope.numPages = Math.ceil(result.totalNumber / $scope.resultPerPage); 
               $scope.cdes = result.cdes;
               $scope.totalItems = result.totalNumber;
               $scope.facets = result.facets;
               $scope.uniqueOrg = false;
            });     
        });
    } ;  
    
    $scope.autocomplete = function(viewValue) {
        // @TODO
        // Typeahead gets called before ng-model binding 
        // So I am setting is manually. Is there a better way to do the next 3 lines?
        if (!$scope.search) {
            $scope.search = {};
        }
        $scope.search.name = viewValue;
        
        return $http.get("/autocomplete?search="+JSON.stringify($scope.search)).then(function(response){ 
            return response.data.names;
        }); 
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
}

function ConceptsCtrl($scope, $modal, $http, $timeout) {
    $scope.openNewConcept = function () {
        $modal.open({
          templateUrl: 'newConceptModalContent.html',
          controller: NewConceptModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.cde;
              }
          }
        });
    };
    
    $scope.removeDecConcept = function (index) {
        $scope.cde.dataElementConcept.concepts.splice(index, 1);
        $scope.cde.unsaved = true;
    };
    
    $scope.removeOcConcept = function (index) {
        $scope.cde.objectClass.concepts.splice(index, 1);
        $scope.cde.unsaved = true;
    };
    
    $scope.removePropConcept = function (index) {
        $scope.cde.property.concepts.splice(index, 1);
        $scope.cde.unsaved = true;
    };
    
    $scope.relatedCdes = function (concept) {
        $http({method: "POST", url: "/desByConcept", data: concept})
                .success(function (data, status) {
                  $scope.cdes = data;         
            });
    };
}

function SaveCdeCtrl($scope, $modal, $http, $timeout) { 
    $scope.checkVsacId = function(cde) {
        $http({method: "GET", url: "/vsacBridge/" + cde.dataElementConcept.conceptualDomain.vsac.id}).
         error(function(data, status) {
            $scope.vsacError = "Error quering VSAC.";
            cde.dataElementConcept.conceptualDomain.vsac.id = "";
         }).
         success(function(data, status) {
            if (data === "") {
                $scope.vsacError = "Invalid VSAC OID";
                cde.dataElementConcept.conceptualDomain.vsac.id = "";
            } else {
                cde.dataElementConcept.conceptualDomain.vsac.name = data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].displayName;
                cde.dataElementConcept.conceptualDomain.vsac.version = data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].version;
                cde.unsaved = true;
            }
         })
         ;
    };
    
    $scope.attachPv = function(pv) {
        var code = "null";
        for (var i = 0; i < $scope.vsacValueSet.length && code === "null"; i++) {
            if (pv.valueMeaningName === $scope.vsacValueSet[i].displayName) {
                code = $scope.vsacValueSet[i];
            }
        }
        if (code !== "null") {
            pv.valueMeaningName = code.displayName;
            pv.valueMeaningCode = code.code;
            pv.codeSystemName = code.codeSystemName;
            $scope.stageCde($scope.cde);
        }
    };
    
    $scope.removePv = function(index) {
        $scope.cde.valueDomain.permissibleValues.splice(index, 1);
        $scope.stageCde($scope.cde);
    };
    $scope.addPv = function() {
        $scope.cde.valueDomain.permissibleValues.push({permissibleValue: "Unspecified"});
    };
    
    $scope.movePvUp = function(index) {
        var pvArray = $scope.cde.valueDomain.permissibleValues;
        pvArray.splice(index - 1, 0, pvArray.splice(index, 1)[0]);    
        $scope.stageCde($scope.cde);
    };
    
    $scope.movePvDown = function(index) {
        var pvArray = $scope.cde.valueDomain.permissibleValues;
        pvArray.splice(index + 1, 0, pvArray.splice(index, 1)[0]);    
        $scope.stageCde($scope.cde);
    };
    
    
    $scope.removeVSMapping = function() {
        delete $scope.cde.dataElementConcept.conceptualDomain.vsac;
        $scope.stageCde($scope.cde);
    };
    

    $scope.stageCde = function(cde) {
        cde.unsaved = true;
    };
        
    $scope.openRegStatusUpdate = function () {
        var modalInstance = $modal.open({
          templateUrl: 'regStatusUpdate.html',
          controller: SaveCdeModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.cde;
              }
              , user: function() {
                  return $scope.user;
              }          
          }
        });

        modalInstance.result.then(function () {
            $scope.message = "Saved";
            $timeout(function() {
                delete $scope.message;
            }, 3000);
        }, function () {
        });        
    };
    
    $scope.openSave = function () {
        $modal.open({
          templateUrl: 'saveCdeModalContent.html',
          controller: SaveCdeModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.cde;
              }
              , user: function() {
                  return $scope.user;
              } 
          }
        });
    };
    
    $scope.openNewNamePair = function () {
        $modal.open({
          templateUrl: 'newNamePairModalContent.html',
          controller: NewNamePairModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.cde;
              }
          }
        });
    };  
    
    $scope.stageNewName = function(namePair) {
      $scope.stageCde($scope.cde);
      namePair.editMode = false;
    };
    
    $scope.cancelSave = function(namePair) {
        namePair.editMode = false;
    };
    
    $scope.removeNamePair = function(index) {
        $scope.cde.naming.splice(index, 1);
        $scope.stageCde($scope.cde);          
    };
    
};

function NewNamePairModalCtrl($scope, $modalInstance, cde) {
    $scope.newNamePair = {
        "languageCode" : "EN-US"
        , context: {
            contextName: "Health"
            , "acceptability" : "preferred"
        }
    };
    $scope.cde = cde;
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.okCreate = function() {
        cde.naming.push($scope.newNamePair);
        cde.unsaved = true;
        $modalInstance.close();
    };
};

function NewConceptModalCtrl($scope, $modalInstance, cde) {
    $scope.newConcept = {origin: "LOINC", type: "dec"};
    $scope.cde = cde;
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.okCreate = function() {
        if (!cde.dataElementConcept) cde.dataElementConcept = {};
        if ($scope.newConcept.type === "dec") {
            if (!cde.dataElementConcept.concepts) cde.dataElementConcept.concepts = [];
            cde.dataElementConcept.concepts.push($scope.newConcept);
        } else if ($scope.newConcept.type === "prop") {
            if (!cde.property.concepts) cde.property.concepts = [];
            cde.property.concepts.push($scope.newConcept);
        } else if ($scope.newConcept.type === "oc") {
            if (!cde.objectClass.concepts) cde.objectClass.concepts = [];
            cde.objectClass.concepts.push($scope.newConcept);
        } 
        cde.unsaved = true;
        $modalInstance.close();
    };
};

var SaveCdeModalCtrl = function ($scope, $window, $modalInstance, cde, user) {
  $scope.cde = cde;
  $scope.user = user;

  $scope.stewardRegStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Retired'];

  $scope.ok = function () {
    $scope.cde.$save(function (newcde) {
        $window.location.href = "/#/deview?cdeId=" + newcde._id;
        $modalInstance.close();
    });
  };

  $scope.cancelSave = function () {
    $modalInstance.dismiss('cancel');
  };
};

function LinkVsacCtrl($scope, LinkToVsac) {    
    $scope.linktovsac = function(cde, vsId) {
        LinkToVsac.link({cde_id: cde._id, vs_id: vsId}, function(dataElement) {
           var ind = $scope.cdes.indexOf(cde);
           $scope.cdes[ind] = dataElement;
       });
    };
}

var HistoryModalCtrl = function ($scope, $modalInstance, PriorCdes, cdeId) {
    PriorCdes.getCdes({cdeId: cdeId}, function(dataElements) {
       $scope.priorCdes = dataElements;
   });    
    
  $scope.ok = function () {
    $modalInstance.close();
  };
};

function AuditCtrl($scope) {
    $scope.openHistory = function () {
        var modalInstance = $modal.open({
          templateUrl: 'saveCdeModalContent.html',
          controller: SaveCdeModalCtrl,
          resolve: {
              cdeId: function() {
                  return $scope.cde_id;
              }
          }
        });

        modalInstance.result.then(function () { 
        }, function () {
        });
    };    
}

function CreateCdeCtrl($scope, $location, $timeout, DataElement, $http) {
    $scope.setActiveMenu('CREATECDE');

    $scope.save = function() {
        // !TODO probably not the best way to do this
        $scope.cde.naming = [];
        $scope.cde.naming.push({
           designation: $scope.cde.designation
           , definition: $scope.cde.definition
           , context: {
               contextName: "Health"
               , acceptability: "preferred"
           }
        });
        delete $scope.cde.designation;
        delete $scope.cde.definition;
        
        DataElement.save($scope.cde, function(cde) {
            $location.path('#/');        
        });
    };
    
    var suggestionPromise = 0;
    $scope.showSuggestions = function () {
        if (suggestionPromise !== 0) {
            $timeout.cancel(suggestionPromise);
        }
        suggestionPromise = $timeout(function () {
            // @TODO Reuse this bit.
            var queryStuff = {query: 
                {   
                    bool: {
                        should: {
                        function_score: {
                            boost_mode: "replace"
                            , script_score: {
                                script: "_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)"
                            }
                            , query: {
                                query_string: {
                                    fields: ["_all", "naming.designation^3"]
                                    , query: $scope.cde.designation
                                }
                            }
                        }
                        }
                        , must_not: {
                            term: {
                                "registrationState.registrationStatus": "retired"
                            }
                        }
                    }
               }};
            
           var result = $http.post("/elasticSearch", {query: queryStuff}).then(function (response) {
               var result = response.data;
               $scope.cdes = result.cdes;
           });
        }, 1000);
    };
}

function DEViewCtrl($scope, $routeParams, $window, $http, DataElement, PriorCdes, CdeDiff) {
    $scope.initialized = false;
    $scope.detailedView = true;
    $scope.canLinkPv = false;
    $scope.vsacValueSet = [];
    $scope.mltCdes = [];
    $scope.boards = [];
    $scope.comment = {};
    $scope.saveDefinitionAsHtml = false;
    $scope.reload = function(deId, cb) {
        DataElement.get({deId: deId}, function (de) {
           $scope.cde = de;          
           $scope.loadValueSet();
           $scope.initialized = true;
           $scope.canLinkPvFunc();
           $scope.loadMlt();
           $scope.loadBoards();
        });
        
        PriorCdes.getCdes({cdeId: deId}, function(dataElements) {
            $scope.priorCdes = dataElements;
        }); 
        
    };
    
    $scope.reload($routeParams.cdeId);

    var indexedConceptSystemClassifications = [];
    $scope.classificationToFilter = function() {
         indexedConceptSystemClassifications = [];
         if ($scope.cde != null) {
             return $scope.cde.classification;
         } 
    };
    
    $scope.filterConceptSystemClassification = function(item) {
      var systemIsNew = indexedConceptSystemClassifications.indexOf(item.conceptSystem) == -1;
      if (systemIsNew) {
          indexedConceptSystemClassifications.push(item.conceptSystem);
      }
      return systemIsNew;
    };
    
    $scope.isInConceptSystem = function(system) {
        return function(classi) {
            return classi.conceptSystem === system;
        };
    };

    $scope.isAllowedNonCuration = function (cde) {
        if ($scope.initialized && cde.archived) {
            return false;
        }
        if ($scope.user.siteAdmin) {
            return true;
        } else {   
            if ($scope.initialized && $scope.myOrgs) {
                return $scope.myOrgs.indexOf(cde.stewardOrg.name) > -1;
            } else {
                return false;
            }
        }

    };
    $scope.inlineAreaEditVisibility = function (areaFormat,cdeFormat){
        return areaFormat==cdeFormat;
    };        
    
    $scope.isAllowed = function (cde) {
        if ($scope.initialized && cde.archived) {
            return false;
        }
        if ($scope.user.siteAdmin) {
            return true;
        } else {   
            if ($scope.initialized && 
                    ((cde.registrationState.registrationStatus === "Standard" || cde.registrationState.registrationStatus === "Standard") )) {
                return false;
            }
            if ($scope.initialized && $scope.myOrgs) {
                return $scope.myOrgs.indexOf(cde.stewardOrg.name) > -1;
            } else {
                return false;
            }
        }
    };
   
    $scope.save = function() {
        $scope.cde.$save(function (cde) {
            $window.location.href = "/#/deview?cdeId=" + cde._id;
        });
    }; 
    
    $scope.revert = function(cde) {
        $scope.reload(cde._id);
    };
    
    $scope.viewDiff = function (cde) {
        var dmp = new diff_match_patch();
        
        CdeDiff.get({deId: cde._id}, function(diffResult) {
            $scope.diff = {};
            if (diffResult.before.name) {
                var d = dmp.diff_main(diffResult.before.name, diffResult.after.name);
                dmp.diff_cleanupSemantic(d);
                $scope.diff.name = dmp.diff_prettyHtml(d);
            }
            if (diffResult.before.definition) {
                var d = dmp.diff_main(diffResult.before.definition, diffResult.after.definition);
                dmp.diff_cleanupSemantic(d);
                $scope.diff.definition = dmp.diff_prettyHtml(d);
            }            
            if (diffResult.before.version) {
                $scope.diff.version = "Before: " + diffResult.before.version + " -- After: " + diffResult.after.version;
            }
            if (diffResult.before.datatype || diffResult.after.datatype) {
                $scope.diff.datatype = "Before: " + diffResult.before.datatype + " -- After: " + diffResult.after.datatype;
            }
            if (diffResult.before.uom) {
                var d = dmp.diff_main(diffResult.before.uom, diffResult.after.uom);
                dmp.diff_cleanupSemantic(d);
                $scope.diff.uom = dmp.diff_prettyHtml(d);
            }
            if (diffResult.before.permissibleValues || diffResult.after.permissibleValues) {
                $scope.diff.permissibleValues = "Modified";
            }
        });
    };
    
    $scope.isPvInVSet = function(pv, callback) {
            for (var i = 0; i < $scope.vsacValueSet.length; i++) {
                if (pv.valueMeaningCode == $scope.vsacValueSet[i].code && 
                    pv.codeSystemName == $scope.vsacValueSet[i].codeSystemName &&
                    pv.valueMeaningName == $scope.vsacValueSet[i].displayName) {
                        return callback(true);
                }
            }
            return callback(false);
    };
    
    $scope.validatePvWithVsac = function() {
        var pvs = $scope.cde.valueDomain.permissibleValues;
        for (var i = 0; i < pvs.length; i++) {
           $scope.isPvInVSet(pvs[i], function(wellIsIt) {
                pvs[i].isValid = wellIsIt;
           });
        }
    };
    
    $scope.runManualValidation = function () {
        delete $scope.showValidateButton;
        $scope.validatePvWithVsac();
        $scope.validateVsacWithPv();
    };
    
   $scope.isVsInPv = function(vs, callback) {
       var pvs = $scope.cde.valueDomain.permissibleValues;
            for (var i = 0; i < pvs.length; i++) {
                if (pvs[i].valueMeaningCode == vs.code && 
                    pvs[i].codeSystemName == vs.codeSystemName &&
                    pvs[i].valueMeaningName == vs.displayName) {
                        return callback(true);
                }
            }
            return callback(false);
    };
    
    $scope.validateVsacWithPv = function() {
        for (var i = 0; i < $scope.vsacValueSet.length; i++) {
           $scope.isVsInPv($scope.vsacValueSet[i], function(wellIsIt) {
                $scope.vsacValueSet[i].isValid = wellIsIt;
           });
        }
    };
    
    $scope.loadValueSet = function() {
        var dec = $scope.cde.dataElementConcept;
        if (dec != null && dec.conceptualDomain != null && dec.conceptualDomain.vsac !=  null) {
            $scope.vsacValueSet = [];
            $http({method: "GET", url: "/vsacBridge/" + dec.conceptualDomain.vsac.id}).
             error(function(data, status) {
                $scope.vsacError = "Error quering VSAC.";
                cde.dataElementConcept.conceptualDomain.vsac.id = "";
             }).
             success(function(data, status) {
                if (data === "") {
                } else {
                    for (var i = 0; i < data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'].length; i++) {
                        $scope.vsacValueSet.push(data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'][i]['$']);
                    }
                    if ($scope.vsacValueSet.length < 50 || $scope.cde.valueDomain.permissibleValues < 50) {
                        $scope.validatePvWithVsac();
                        $scope.validateVsacWithPv();
                    } else {
                        $scope.showValidateButton = true;
                    }
                }
             })
             ;
        }
        $scope.canLinkPvFunc();
    };
    
    // could prob. merge this into load value set.
    $scope.canLinkPvFunc = function() {
        var dec = $scope.cde.dataElementConcept;
        $scope.canLinkPv = ($scope.isAllowed($scope.cde) &&
                dec != null &&
                dec.conceptualDomain != null &&
                dec.conceptualDomain.vsac != null &&
                dec.conceptualDomain.vsac.id != null);
    };   
    
    $scope.loadMlt = function() {
        $http({method: "GET", url: "/moreLikeCde/" + $scope.cde._id}).
             error(function(data, status) {
             }).
             success(function(data, status) {
                 $scope.mltCdes = data.cdes;
             })
        ;
    };
    
    $scope.loadBoards = function() {
        $http.get("/deBoards/" + $scope.cde.uuid).then(function(response) {
            $scope.boards = response.data;
        });
    };
}

function CommentsCtrl($scope, Comment) {
    
    $scope.canRemoveComment = function(com) {
        return (($scope.user._id) && ($scope.user._id == com.user || ($scope.user.orgAdmin.indexOf($scope.cde.stewardOrg.name) > -1)));
    } 
    
    $scope.addComment = function() {        
        Comment.addComment({
            comment: $scope.comment.content
            , deId: $scope.cde._id
            },
            function(res) {
                  $scope.message = res;
                  $scope.reload($scope.cde._id);
            }
        );
        $scope.comment.content = "";
    };
    
    $scope.removeComment = function(commentId) {
        Comment.removeComment({
            commentId: commentId
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.message = res;
            $scope.reload($scope.cde._id);
        });
    };
}

 function RegistrationCtrl($scope, DataElement) {
    $scope.changeStatus = function(cde, status) {
        DataElement.get({cdeId: cde._id}, function(dataElement) {
            dataElement.registrationState.registrationStatus = status;
            dataElement.$save(function () {
                $scope.reload();            
            });
        }); 
    };     
 }
 
 function ClassificationCtrl($scope, $timeout, $modal, Classification) {
    $scope.removeClassification = function(classif) {
        Classification.remove({
            classification: classif
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
            $scope.message = "Classification Removed";
            $timeout(function() {
                delete $scope.message;
            }, 2000);

        });
    };
    
    $scope.openAddClassificationModal = function () {
        var modalInstance = $modal.open({
          templateUrl: 'addClassificationModalContent.html',
          controller: AddClassificationModalCtrl,
          resolve: {
          }
        });

        modalInstance.result.then(function (newClassification) {
            Classification.add({
                classification: newClassification
                , deId: $scope.cde._id
            }, function (res) {
                $scope.message = "Classification Added";
                $scope.cde.classification.push(newClassification);
                $timeout(function() {
                    delete $scope.message;
                }, 2000);
                $scope.cde = res;
            });
        });
    };
 }
 
 function AddClassificationModalCtrl($scope, $modalInstance, $http) {
    $scope.classAutocomplete = function (viewValue) {
        return $http.get("/autocomplete/classification/" + viewValue).then(function(response) { 
            var table = [];
            for (var i =0; i < response.data.length; i++) {
                if (response.data[i].toLowerCase().indexOf(viewValue.toLowerCase()) !== -1) {
                    table.push(response.data[i]);
                }
            }
            return table;
        }); 
     };
     
    $scope.okCreate = function (classification) {
      $modalInstance.close(classification);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
}

 function UsedByCtrl($scope, $timeout, $modal, UsedBy) {
    $scope.removeUsedBy = function(usedBy) {
        UsedBy.remove({
            usedBy: usedBy
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
            $scope.message = "Usage Removed";
            $timeout(function() {
                delete $scope.message;
            }, 2000);

        });
    };
    
    $scope.openAddUsedByModal = function () {
        var modalInstance = $modal.open({
          templateUrl: 'addUsedByModalContent.html',
          controller: AddUsedByModalCtrl,
          resolve: {
          }
        });

        modalInstance.result.then(function (newUsedBy) {
            UsedBy.add({
                usedBy: newUsedBy
                , deId: $scope.cde._id
            }, function (res) {
                $scope.message = "Usage Added";
                $scope.cde.usedByOrgs.push(newUsedBy);
                $timeout(function() {
                    delete $scope.message;
                }, 2000);
                $scope.cde = res;
            });
        });
    };
 }
 
 function AddUsedByModalCtrl($scope, $modalInstance, $http) {
    $scope.orgAutocomplete = function (viewValue) {
        return $http.get("/autocomplete/org/" + viewValue).then(function(response) { 
            return response.data;
        }); 
     };     

    $scope.okCreate = function (classification) {
      $modalInstance.close(classification);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
}
 
function AttachmentsCtrl($scope, $rootScope, Attachment) {     
    $scope.setFiles = function(element) {
        $scope.$apply(function($scope) {
          // Turn the FileList object into an Array
            $scope.files = [];
            for (var i = 0; i < element.files.length; i++) {
                if (element.files[i].size > (5 * 1024 * 1024) ) {
                    $scope.message = "Size is limited to 5Mb per attachment"; 
                } else {
                    $scope.files.push(element.files[i]);
                }
            }
          $scope.progressVisible = false;
        });
    };

    $scope.uploadFiles = function() {
        for (var i in $scope.files) {
            $scope.uploadFile($scope.files[i]);
        }
    };

    $scope.uploadFile = function(file) {
        var fd = new FormData();
        fd.append("de_id", $scope.cde._id);
        fd.append("uploadedFiles", file);
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);
        xhr.open("POST", "/addAttachmentToCde");
        $scope.progressVisible = true;
        xhr.send(fd);
    };

    function uploadProgress(evt) {
        $scope.$apply(function(){
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total);
            } else {
                $scope.progress = 'unable to compute';
            }
        });
    }

    function uploadComplete(evt) {
        $rootScope.$apply(function() {
            var resp = JSON.parse(evt.target.responseText);
            if (!resp.message) {
                $scope.cde = JSON.parse(evt.target.responseText);
                $scope.files = [];
                $scope.message = "";
            } else {
                $scope.message = resp.message;
            }
        });
    }

    function uploadFailed(evt) {
        // TODO
    }

    function uploadCanceled(evt) {
        $scope.$apply(function(){
            $scope.progressVisible = false;
        });
    }
    
    $scope.removeAttachment = function(index) {
        Attachment.remove({
            index: index
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
        });
    };
    
    $scope.setDefault = function(index, state) {
        if (!$scope.isAllowedNonCuration($scope.cde)) {
            return;
        };
        Attachment.setDefault({
            index: index
            , state: state
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
        });
    };
 };
 
 