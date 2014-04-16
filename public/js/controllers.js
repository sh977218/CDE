function MainCtrl($scope,$modal, Myself, $http, $location, $anchorScroll, $timeout) {
    $scope.loadUser = function(callback) {
        Myself.get(function(u) {
            $scope.user = u;
            $scope.setMyOrgs(); 
            $scope.loadBoards();
            callback();
        });
    };
    
    $scope.alerts = [];
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
    $scope.addAlert = function(type, msg) {
        var id = (new Date()).getTime();
        $scope.alerts.push({type: type, msg: msg, id: id});
        $timeout(function() {
            for (var i = 0; i < $scope.alerts.length; i++) {
                if ($scope.alerts[i].id === id) {
                    $scope.alerts.splice(i, 1);
                }
            }
        }, 5000);
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
    
    $scope.registrationStatuses = ['Retired', 'Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Standard', 'Preferred Standard'];

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
            $scope.compareCart.push(cdeId._id);
        }
    };
    $scope.emptyCart = function() {
        $scope.compareCart = [];
    }
    
    $scope.cdeIconAction = function (cde, action, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        switch (action) {
            case "view":
                $scope.view(cde);
            break;
            case "openPinModal":
                $scope.openPinModal(cde);
            break;
            case "addToCompareCart":
                $scope.addToCompareCart(cde);
            break;
        }        
    };
    
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
                if (response.status==200)
                    $scope.addAlert("success", response.data);
                else
                    $scope.addAlert("warning", response.data);
            }, function (response){
                $scope.addAlert("danger", response.data);
            });
        }, function () {
        });
    };
        
    $scope.view = function(cde) {       
        $location.url("deview?cdeId=" + cde._id);
    };    

    $scope.showCompareButton = function(cde) {
        return $scope.compareCart.length < 2 && cde !== undefined &&
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

function ClassificationManagementCtrl($scope, $http, $modal, Classification) {
    if ($scope.myOrgs.length > 0) {
        $scope.orgToManage = $scope.myOrgs[0];
    }
    
    $scope.org = {};
    
    $scope.updateOrg = function() {
        if ($scope.orgToManage !== undefined) {
            $http.get("/org/" + $scope.orgToManage).then(function(response) {
               $scope.org = response.data;
            });
        }
    }
    
    $scope.updateOrg();
    
    var indexedConceptSystemClassifications = [];
    $scope.classificationToFilter = function() {
         indexedConceptSystemClassifications = [];
         return $scope.org.classifications;
    };
    
    $scope.removeClassification = function(orgName, conceptSystem, concept) {
        var classToDel = {stewardOrg:{name:orgName}, conceptSystem:conceptSystem, concept:concept};
        $http.post("/removeClassificationFromOrg", classToDel).then(function(response) {
            $scope.addAlert("success", response.data);
            $scope.updateOrg();
        });
    }
    
    $scope.openAddClassificationModal = function () {
        var modalInstance = $modal.open({
          templateUrl: 'addClassificationModalContent.html',
          controller: AddClassificationToOrgModalCtrl,
          resolve: {
            org: function() {
                return $scope.orgToManage;
            }          
          }
        });

        modalInstance.result.then(function (newClassification) {
            newClassification.stewardOrg = {name: $scope.orgToManage};
            Classification.addToOrg(newClassification, function (res) {
                $scope.addAlert("success", "Classification Added");
                $scope.updateOrg();
            });
        });
    };
}

function AddClassificationToOrgModalCtrl($scope, $modalInstance, $http, org) {
    $scope.orgClassSystems = [];
    $scope.getOrgClassSystems = function () {
        $http.get("/autocomplete/classification/org/" + org).then(function(response) { 
            $scope.orgClassSystems = response.data;
        });
    };
    $scope.getOrgClassSystems();
     
    $scope.okCreate = function (classification) {
      $modalInstance.close(classification);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
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

function MyBoardsCtrl($scope, $modal, $http, Board) {
    $scope.setActiveMenu('MYBOARDS');
    
    $scope.removeBoard = function(index) {
        $http.delete("/board/" + $scope.boards[index]._id).then(function (response) {
            $scope.addAlert("success", "Board removed");
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
        $http.post("/board", board).then(function(response) {
            $scope.addAlert("success", "Saved");
            $scope.loadBoards();
        });
    };
        
    $scope.openNewBoard = function () {
        var modalInstance = $modal.open({
          templateUrl: 'newBoardModalContent.html',
          controller: NewBoardModalCtrl,
          resolve: {
          }
        });
        modalInstance.result.then(function (newBoard) {
            newBoard.shareStatus = "Private";
            Board.save(newBoard, function(res) {
                $scope.addAlert("success", "Board created.");
                $scope.loadBoards();
            });
        });
    };
}

function NewBoardModalCtrl($scope, $modalInstance) {
    $scope.newBoard = {};
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.okCreate = function() {
        $modalInstance.close($scope.newBoard);
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
            $scope.siteAdmins = response.data;
        });
    };
    $scope.getSiteAdmins();

    $scope.getOrgs = function() {
        return $http.get("/managedOrgs").then(function(response) {
            $scope.orgs = response.data.orgs;
        });
    };
    $scope.getOrgs(); 

    $scope.getOrgAdmins = function() {
        return $http.get("/orgAdmins").then(function(response) {
            $scope.orgAdmins = response.data.orgs;
        });
    };
    $scope.getOrgAdmins(); 
    
    $scope.getMyOrgAdmins = function() {
        return $http.get("/myOrgsAdmins").then(function(response) {
            $scope.myOrgAdmins = response.data.orgs;
        });
    };
    $scope.getMyOrgAdmins();

    $scope.getOrgCurators = function() {
        return $http.get("/orgcurators").then(function(response) {
            $scope.orgCurators = response.data.orgs;
        });
    };
    $scope.getOrgCurators(); 
    
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

function DEListCtrl($scope, $http, $modal, $cacheFactory) {
    $scope.setActiveMenu('LISTCDE');
    
    var cache;
    if ($cacheFactory.get("deListCache") === undefined) {
        cache = $cacheFactory("deListCache");
    } else {
        cache = $cacheFactory.get("deListCache");
    }
    
    $scope.registrationStatuses = cache.get("registrationStatuses");
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

    $scope.ftsearch = cache.get("ftsearch");

    $scope.selectedOrg = cache.get("selectedOrg");
    $scope.selectedGroup = cache.get("selectedGroup");
    $scope.selectedSubGroup = cache.get("selectedSubGroup"); 
    $scope.totalItems = cache.get("totalItems");
    
    $scope.currentPage = cache.get("currentPage");
    if ($scope.currentPage === undefined) {
        $scope.currentPage = 1;
    }
    
    $scope.$watch('currentPage', function() {
        cache.put("currentPage", $scope.currentPage)
        $scope.reload();
    });

    $scope.addOrgFilter = function(t) {
        if ($scope.selectedOrg === undefined) {
            $scope.selectedOrg = t.term;
            cache.put("selectedOrg", t.term);
        } else {
            delete $scope.selectedOrg;
            cache.remove("selectedOrg");
            delete $scope.selectedSubGroup;
            cache.remove("selectedSubGroup");
            delete $scope.selectedGroup;
            cache.remove("selectedGroup");
        }
        delete $scope.facets.groups;
        $scope.reload();
    };

    $scope.selectSubGroup = function(subG, system) {
        if ($scope.selectedSubGroup === undefined) {
            $scope.selectedSubGroup = subG;
            cache.put("selectedSubGroup", subG);
        } else {
            delete $scope.selectedSubGroup;
            cache.remove("selectedSubGroup");
        }
        $scope.reload();
    };

    $scope.selectGroup = function(g) {
        if ($scope.selectedGroup === undefined) {
            $scope.selectedGroup = g;
            cache.put("selectedGroup", g);
        } else {
            delete $scope.selectedGroup;
            cache.remove("selectedGroup");
            delete $scope.selectedSubGroup;
            cache.remove("selectedSubGroup");
        }
    };
    
    $scope.addStatusFilter = function(t) {
        t.selected = !t.selected;
        cache.put("registrationStatuses", $scope.registrationStatuses);
        $scope.reload();
    };
    
    $scope.reload = function() {
        $scope.buildElasticQuery(function(query) {
            $http.post("/elasticSearch", query).then(function (response) {
                var result = response.data;
                $scope.numPages = Math.ceil(result.totalNumber / $scope.resultPerPage); 
                $scope.cdes = result.cdes;
                $scope.totalItems = result.totalNumber;
                cache.put("totalItems", $scope.totalItems);
                $scope.facets = result.facets;
                
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
        
        if ($scope.selectedOrg !== undefined) {
            $scope.filter.and.push({term: {"classification.stewardOrg.name": $scope.selectedOrg}});
        }
        
        if ($scope.selecteGroup !== undefined) {
            $scope.filter.and.push({term: {"classification.elements.name": $scope.selecteGroup.term}});
        }        

        if ($scope.selectedSubGroup !== undefined) {
            $scope.filter.and.push({term: {"classification.elements.elements.name": $scope.selectedSubGroup.term}});
        }
        
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

        if ($scope.selectedOrg !== undefined) {
            queryStuff.facets.groups = {
                terms: {field: "classification.elements.name", size: 200}
                , facet_filter: {term: {"classification.stewardOrg.name": $scope.selectedOrg}}
            }
            queryStuff.facets.concepts = {
                terms: {field: "classification.elements.elements.name", size: 300}
                , facet_filter: {
                    term: {"classification.stewardOrg.name": $scope.selectedOrg}
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
        $scope.reload();
    }

    $scope.search = function() {
        cache.put("ftsearch", $scope.ftsearch);
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
}

function ConceptsCtrl($scope, $modal, $http) {
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

function SaveCdeCtrl($scope, $modal, $http) { 
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
        $scope.runManualValidation();
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
    
    $scope.removeAllPvs = function() {
        $scope.cde.valueDomain.permissibleValues = [];
        $scope.runManualValidation();
        $scope.stageCde($scope.cde);
    };  
    
    $scope.addAllVsac = function () {
        for (var i=0; i<$scope.vsacValueSet.length; i++) { 
            $scope.addVsacValue($scope.vsacValueSet[i]);
        }        
    };
    
    $scope.addVsacValue = function(vsacValue) {
        if ($scope.isVsInPv(vsacValue)) {
            return;
        }
        $scope.cde.valueDomain.permissibleValues.push($scope.convertVsacValueToPv(vsacValue));
        $scope.stageCde($scope.cde);
        $scope.runManualValidation();
    };    
    
    $scope.convertVsacValueToPv = function(vsacValue) {
        var mongoPv = {
            "permissibleValue": vsacValue.displayName,
            "valueMeaningName": vsacValue.displayName,
            "valueMeaningCode": vsacValue.code,
            "codeSystemName": vsacValue.codeSystemName,
            "codeSystemVersion": vsacValue.codeSystemVersion
        };        
        return mongoPv;
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
            $scope.addAlert("success", "Saved");
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

function DEViewCtrl($scope, $routeParams, $window, $http, $timeout, DataElement, PriorCdes, CdeDiff) {
    $scope.initialized = false;
    $scope.detailedView = true;
    $scope.canLinkPv = false;
    $scope.vsacValueSet = [];
    $scope.mltCdes = [];
    $scope.boards = [];
    $scope.comment = {};
    $scope.pVTypeheadVsacNameList = [];
    $scope.pVTypeaheadCodeSystemNameList = [];
    
    $scope.reload = function(deId, cb) {
        DataElement.get({deId: deId}, function (de) {
           $scope.cde = de;          
           $scope.loadValueSet();
           $scope.initialized = true;
           $scope.canLinkPvFunc();
           $scope.loadMlt();
           $scope.loadBoards();      
           $scope.getPVTypeaheadCodeSystemNameList();   
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
        if (!pvs) {
            return;
        }
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
    
    $scope.runDelayedManualValidation = function() {
        $timeout(function(){
            $scope.runManualValidation();
        },100);
    };
       
    $scope.isVsInPv = function(vs, callback) {
        var returnVal = function(value){
            if (callback) {
                return callback(value);
            } else {
                return value;
            }
        };
        var pvs = $scope.cde.valueDomain.permissibleValues;
        if (!pvs) {
            return returnVal(false);       
        }
        for (var i = 0; i < pvs.length; i++) {
            if (pvs[i].valueMeaningCode === vs.code && 
                pvs[i].codeSystemName === vs.codeSystemName &&
                pvs[i].valueMeaningName === vs.displayName) {
                    return returnVal(true);
            }
        }
        return returnVal(false);
    };    
    
    $scope.validateVsacWithPv = function() {
        for (var i = 0; i < $scope.vsacValueSet.length; i++) {
           $scope.isVsInPv($scope.vsacValueSet[i], function(wellIsIt) {
                $scope.vsacValueSet[i].isValid = wellIsIt;
           });
        }
    };
    
    $scope.allVsacMatch = function () {
        var allVsacMatch = true;
        for (var i = 0; i < $scope.vsacValueSet.length; i++) {
            allVsacMatch = allVsacMatch && $scope.vsacValueSet[i].isValid;
        }
        return allVsacMatch;
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
                    $scope.getPVTypeheadVsacNameList();                   
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
    
    $scope.getPVTypeheadVsacNameList = function() {
        $scope.pVTypeheadVsacNameList =  $scope.vsacValueSet.map(function(obj) {
            return obj.displayName;
        });       
    };    
    
    $scope.getPVTypeaheadCodeSystemNameList = function() {
        $http.get("/permissibleValueCodeSystemList").then(function(response) {
            $scope.pVTypeaheadCodeSystemNameList = response.data;
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
 
 function ClassificationCtrl($scope, $modal, Classification) {
    $scope.removeClassification = function(classif) {
        Classification.remove({
            classification: classif
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
            $scope.addAlert("success", "Classification Removed");
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
                $scope.addAlert("success", "Classification Added");
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

 function UsedByCtrl($scope, $modal, UsedBy) {
    $scope.removeUsedBy = function(usedBy) {
        UsedBy.remove({
            usedBy: usedBy
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
            $scope.addAlert("success", "Usage Removed");
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
                $scope.addAlert("success", "Usage Added");
                $scope.cde.usedByOrgs.push(newUsedBy);
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
 
 