function MainCtrl($scope, Myself, $http, $location, $anchorScroll) {
    $scope.loadUser = function(callback) {
        Myself.get(function(u) {
            $scope.user = u;
            $scope.setMyOrgs(); 
            callback();
        });
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
    
    $scope.registrationStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Standard', 'Preferred Standard'];

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
    $scope.start = 0;
    $scope.cdes = [];
        
    $scope.reload = function() {
        $http.get("/board/" + $routeParams.boardId + "/" + $scope.start).then(function(response) {
            $scope.cdes = [];
            $scope.board = response.data.board;
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
    $scope.boards = [];
    
    $scope.reload = function() {
        $http.get("/boards/" + $scope.user._id).then(function (response) {
           $scope.boards = response.data;
        }); 
    };
    
    $scope.reload();
    
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

            $scope.reload();
        });
    };
        
    $scope.openNewBoard = function (cde) {
        $modal.open({
          templateUrl: 'newBoardModalContent.html',
          controller: NewBoardModalCtrl,
          resolve: {
          }
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

function DEListCtrl($scope, $http, $timeout, CdeFtSearch, $modal, $location) {
    $scope.setActiveMenu('LISTCDE');
    
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.search = {name: ""};
    $scope.boards = [];
    
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
    
    $http.get("/boards/" + $scope.user._id).then(function (response) {
        $scope.boards = response.data;
    }); 
    
    $scope.view = function(cde) {
        $location.url("deview?cdeId=" + cde._id);
    };
    
    $scope.addFilter = function(t) {
        t.selected = !t.selected;
        $scope.facetSearch();
    };
       
    $scope.$watch('currentPage', function() {
        $scope.reload();
    });

    $scope.setPage = function (pageNo) {
      $scope.currentPage = pageNo;
    };       

    $scope.previous = function () {
        $scope.currentPage--;
    };

    $scope.next = function () {
        $scope.currentPage++;
    };
       
    $scope.facetSearch = function() {
        var filter = {
            and: [
                {terms: {
                        "stewardOrg.name": []
                        , execution: "or"
                    }}
                , {terms: {
                    "registrationState.registrationStatus": []
                    , execution: "or"
                }}
            ]
        };
  
        if ($scope.facets != null) {
            for (var i = 0; i < $scope.facets.orgs.terms.length; i++) {
                var t = $scope.facets.orgs.terms[i];
                if (t.selected) {
                    filter.and[0].terms["stewardOrg.name"].push(t.term);
                }
            }
        
            for (var i = 0; i < $scope.facets.statuses.terms.length; i++) {
                var t = $scope.facets.statuses.terms[i];
                if (t.selected) {
                    filter.and[1].terms["registrationState.registrationStatus"].push(t.term);
                }
            }
        }

        if (filter.and[1].terms["registrationState.registrationStatus"].length === 0) {
             filter.and.splice(1, 1);
        }
        if (filter.and[0].terms["stewardOrg.name"].length === 0) {
             filter.and.splice(0, 1);
        }
                
        var newfrom = ($scope.currentPage - 1) * $scope.pageSize;
        var result = CdeFtSearch.get({from: newfrom, q: JSON.stringify($scope.ftsearch), filter: filter}, function () {
           $scope.numPages = result.pages; 
           $scope.cdes = result.cdes;
           $scope.totalItems = result.totalNumber;
        });
        
    };

    $scope.reload = function() {
        var newfrom = ($scope.currentPage - 1) * $scope.pageSize;
        
        var result = CdeFtSearch.get({from: newfrom, q: JSON.stringify($scope.ftsearch)}, function () {
           $scope.numPages = result.pages; 
           $scope.cdes = result.cdes;
           $scope.totalItems = result.totalNumber;
           $scope.facets = result.facets;
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

var AddToFormModalCtrl = function($scope, MyCart, $modalInstance, cde, AddCdeToForm) {
    $scope.cde = cde;
    
    MyCart.get(function(result) {
        $scope.forms = result.forms;
    });
    $scope.addToForm = function(id) {
        AddCdeToForm.add({cdeId: cde._id, formId: id});
        $modalInstance.close();
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};

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

  $scope.stewardRegStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified'];

  $scope.ok = function () {
    $scope.cde.$save(function (cde) {
        $window.location.href = "/#/deview?cdeId=" + cde._id;
    });
    $modalInstance.close();
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

function EditCtrl($scope, $location, $routeParams, DataElement) {
    var self = this;

    DataElement.get({cdeId: $routeParams.cdeId}, function(dataElement) {
        self.original = dataElement;
        $scope.dataElement = new DataElement(self.original);
    });
 
    $scope.isClean = function() {
        return angular.equals(self.original, $scope.dataElement);
    };
    
    $scope.save = function() {
        $scope.dataElement.$update({cdeId: $scope.dataElement._id});
        $location.path('/');
   };  
}

function CreateCdeCtrl($scope, $location, $timeout, DataElement, CdeList) {
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
           var result = CdeList.get({search: JSON.stringify({name: $scope.cde.designation})}, function () {
               $scope.cdes = result.cdes;
           });
        }, 1000);
    };
}

function ListFormsCtrl($scope, FormList, AddToCart, RemoveFromCart, $http) {
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.setActiveMenu('LISTFORMS');
    $scope.forms = [];
    
    $scope.addToCart = function(form) {
       AddToCart.add({formId: form._id}, function(form) {
           $scope.loadUser(function(){});
       });
    };

    $scope.removeFromCart = function(form) {
       RemoveFromCart.add({formId: form._id}, function(form) {
           $scope.loadUser(function(){});
       });
    };
    
    $scope.isInCart = function(formId) {
        if ($scope.user.formCart) {
            return $scope.user.formCart.indexOf(formId) > -1;
        } else {
            return false;
        }
    };
    
    $scope.autocomplete = function(viewValue) {
        // @TODO
        // Typeahead gets called before ng-model binding 
        // So I am setting is manually. Is there a better way to do the next 3 lines?
        if (!$scope.search) {
            $scope.search = {};
        }
        $scope.search.name = viewValue;
        
        return $http.get("/autocomplete/form/?search="+JSON.stringify($scope.search)).then(function(response) { 
            return response.data.names;
        }); 
    };
    
    $scope.$watch('currentPage', function() {
        $scope.reload();
    });

    $scope.setPage = function (pageNo) {
      $scope.currentPage = pageNo;
    };       

    $scope.previous = function () {
        $scope.currentPage--;
    };

    $scope.next = function () {
        $scope.currentPage++;
    };
    
    $scope.reload = function() {
        var newfrom = ($scope.currentPage - 1) * $scope.pageSize;
        var result = FormList.get({from: newfrom, search: JSON.stringify($scope.search)}, function () {
           $scope.numPages = result.pages; 
           $scope.forms = result.forms;
        });
    } ;    
}

function DEViewCtrl($scope, $routeParams, $window, $http, DataElement, Comment, PriorCdes, CdeDiff) {
    $scope.initialized = false;
    $scope.detailedView = true;
    $scope.canLinkPv = false;
    $scope.vsacValueSet = [];
    $scope.mltCdes = [];
    $scope.boards = [];
    $scope.comment = {};

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
    
    $scope.isAllowed = function (cde) {
        if ($scope.initialized && cde.archived) {
            return false;
        }
        if ($scope.user.siteAdmin) {
            return true;
        }        
        if ($scope.initialized && $scope.myOrgs) {
            return $scope.myOrgs.indexOf(cde.stewardOrg.name) > -1;
        } else {
            return false;
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
                $scope.diff.version = "Before: " + diffResult.before.version + " -- After: " + diffResult.after.version
            }
            if (diffResult.before.datatype || diffResult.after.datatype) {
                $scope.diff.datatype = "Before: " + diffResult.before.datatype + " -- After: " + diffResult.after.datatype
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
                    $scope.validatePvWithVsac();
                    $scope.validateVsacWithPv();
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

function FormViewCtrl($scope, $routeParams, $http, Form, DataElement, CdesInForm) {
    $scope.reload = function(formId) {
        Form.get({formId: formId}, function(form) {
            $scope.form = form;
            CdesInForm.getCdes({formId: formId}, function(cdes) {
                $scope.cdes = cdes;
                for (var k=0; k < form.modules.length; k++) {
                    for (var i = 0; i < form.modules[k].questions.length; i++) {
                        var q = form.modules[k].questions[i];
                        for (var j = 0; j < cdes.length; j++) {
                            if (cdes[j]._id === q.dataElement.de_id) {
                                q.cde = cdes[j];
                            }
                        }
                    }
                }
                for (var i = 0; i < form.questions.length; i++) {
                        var q = form.questions[i];
                        for (var j = 0; j < cdes.length; j++) {
                        if (cdes[j]._id === q.dataElement.de_id) {
                            q.cde = cdes[j];
                        }
                    }
                }
                $scope.original = $scope.form;
                if ($scope.user.siteAdmin) {
                    $scope.canEdit = true;
                } else if ($scope.myOrgs) {
                    $scope.canEdit = $scope.myOrgs.indexOf($scope.form.stewardOrg.name) > -1;
                } else {
                    $scope.canEdit = false;
                }
            });
        });
    };
    
    $scope.reload($routeParams.formId);
    
    $scope.isAllowed = function () {
        return $scope.canEdit;
    };
    
    $scope.stageForm = function() {
        $scope.form.unsaved = true;
    };
    
    $scope.revert = function() {
        $scope.reload($scope.form._id);
    };
    
    $scope.save = function() {
        $scope.form.$save();
        $scope.reload($scope.form._id);
    }; 
    
    $scope.remove = function(array, index) {
        array.splice(index, 1);
        $scope.stageForm();
    };
    
    $scope.sortUp = function(qArray, index) {
        qArray.splice(index - 1, 0, qArray.splice(index, 1)[0]);    
        $scope.stageForm();
    };
    
    $scope.sortDown = function(qArray, index) {
        qArray.splice(index + 1, 0, qArray.splice(index, 1)[0]);    
        $scope.stageForm();
    };

    $scope.sectionUp = function(index) {
        $scope.form.modules.splice(index - 1, 0, $scope.form.modules.splice(index, 1)[0]);    
        $scope.stageForm();
    };
    
    $scope.sectionDown = function(index) {
        $scope.form.modules.splice(index + 1, 0, $scope.form.modules.splice(index, 1)[0]);    
        $scope.stageForm();
    };
        
    $scope.insertSection = function(index) {
        $scope.form.modules.splice(index, 0, {name: "Untitled Section", questions: []});
    };
        
    $scope.autocomplete = function(viewValue) {
        return $http.get("/autocomplete/" + viewValue).then(function(response) { 
            return response.data;
        }); 
    }; 
    $scope.addQuestionToSection = function(newQuestion, index) {
        DataElement.get({deId: newQuestion._id}, function (de) {
            $scope.form.modules[index].questions.push({
                value: newQuestion.naming[0].designation
                , instructions: ''
                , dataElement: {de_id: newQuestion._id}
                , cde: de
            });
        });
        $scope.stageForm();
    };
};

function CartCtrl($scope, MyCart, RemoveFromCart) {
    $scope.setActiveMenu('CART');
    
    $scope.loadForms = function() {
      MyCart.get(function(result) {
        $scope.forms = result.forms;
      });  
    };
    
    $scope.loadForms();

    $scope.isInCart = function(formId) {
        if ($scope.user.formCart) {
            return $scope.user.formCart.indexOf(formId) > -1;
        } else {
            return false;
        }
    };

    $scope.removeFromCart = function(form) {
       RemoveFromCart.add({formId: form._id}, function(form) {
           $scope.loadUser(function() {
               $scope.loadForms();
           });
       });
    }; 
}

function CreateFormCtrl($scope, $location, Form) {
    $scope.save = function() {
        Form.save($scope.form, function(form) {
            $location.path('#/listforms');        
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
 
 function AttachmentsCtrl($scope, $rootScope, Attachment, DataElement) {     
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
        if (!$scope.isAllowed($scope.cde)) {
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
 
 