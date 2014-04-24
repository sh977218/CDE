function MainCtrl($scope,$modal, Myself, $http, $location, $anchorScroll, $timeout, $cacheFactory) {
    $scope.loadUser = function(callback) {
        Myself.get(function(u) {
            $scope.user = u;
            $scope.setMyOrgs(); 
            $scope.loadBoards();
            $scope.initialized = true;
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
        } else {
            $scope.myOrgs = [];
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
    
    $scope.initCache = function() {
        if ($cacheFactory.get("deListCache") === undefined) {
            $scope.cache = $cacheFactory("deListCache");
        } else {
            $scope.cache = $cacheFactory.get("deListCache");
        }        
    };   
    
    $scope.cacheOrgFilter = function(t) {
        $scope.cache.put("selectedOrg", t);       
    };
    
    $scope.removeCacheOrgFilter = function() {
        $scope.cache.remove("selectedOrg");
        $scope.cache.remove("selectedSubGroup");            
        $scope.cache.remove("selectedGroup");        
    };

    $scope.cacheSubGroup = function(subG) {
        $scope.cache.put("selectedSubGroup", subG);
    };
    
    $scope.removeCacheSubGroup = function() {
        $scope.cache.remove("selectedSubGroup");
    };    

    $scope.cacheGroup = function(g) {
        $scope.cache.put("selectedGroup", g);
    };  
    
    $scope.removeCacheGroup = function() {
        $scope.cache.remove("selectedGroup");
        $scope.cache.remove("selectedSubGroup");
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
}
