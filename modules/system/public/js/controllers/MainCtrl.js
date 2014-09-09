function MainCtrl($scope, $modal, Myself, $http, $location, $anchorScroll, $timeout, $cacheFactory, $interval, isAllowedModel, $window, screenSize, GetOrgsDetailedInfo) {
    // Global variables
    var GLOBALS = {
        max_quickboard_cdes : 10
        , getOrgsInterval : 1000 * 60 * 10 * 1 // 10 min

    };
    
    $scope.isLoggedIn = function() {
        return typeof($scope.user._id)!=="undefined";
    };
    
    $scope.loadUser = function(callback) {
        Myself.get(function(u) {
            $scope.user = u;
            $scope.setMyOrgs(); 
            $scope.loadBoards();
            $scope.userLoaded = true;
            callback();
        });
    };
    
    $scope.checkSystemAlert = function() {
        $http.get('/systemAlert').then(function (response) {
           if (response.data.length > 0) {
                var id = (new Date()).getTime();
                if ($scope.broadcast !== response.data) {
                    $scope.broadcast = response.data;                
                    $scope.alerts.push({type: "warning", msg: $scope.broadcast, id: id});
                }
           }
           $timeout(function() {
               $scope.checkSystemAlert();
           }, 120000);
        });
    };
    $scope.checkSystemAlert();
    
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
        return $scope.user !== undefined && $scope.user.siteAdmin;
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
    
    $scope.quickBoard = [];
    $scope.addToQuickBoard = function(cdeId) {
        if( $scope.quickBoard.length < GLOBALS.max_quickboard_cdes ) {
            $scope.quickBoard.push(cdeId.uuid);
        }
    };
    
    $scope.emptyQuickBoard = function() {
        $scope.quickBoard = [];
    };
    
    $scope.accordionIconAction = function (elt, action, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        switch (action) {
            case "view":
                $scope.view(elt);
            break;
            case "openPinModal":
                $scope.openPinModal(elt);
            break;
            case "addToQuickBoard":
                $scope.addToQuickBoard(elt);
            break;
            case "viewNewTab":
                $scope.viewNewTab(elt);
            break;    
        }        
    };
    
    $scope.openPinModal = function (cde) {
        var modalInstance = $modal.open({
          templateUrl: '/cde/public/html/selectBoardModal.html',
          controller: SelectBoardModalCtrl,
          resolve: {
            boards: function () {
              return $scope.boards;
            }
          }
        });

        modalInstance.result.then(function (selectedBoard) {
            $http.put("/pincde/" + cde.uuid + "/" + selectedBoard._id).then(function(response) {
                if (response.status==200) {
                    $scope.addAlert("success", response.data);
                    $scope.loadBoards();
                } else
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
    
    $scope.viewNewTab = function(cde) {       
        $window.open("#/deview?cdeId=" + cde._id);
    };            

    $scope.showCompareButton = function(cde) {
        return $scope.quickBoard.length < GLOBALS.max_quickboard_cdes &&
               cde !== undefined &&
               $scope.quickBoard.indexOf(cde.uuid) < 0;
    };

    $scope.isPageActive = function (viewLocation) { 
        return viewLocation === $location.path();
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
        $scope.cache.remove("selectedElements");            
    };

    $scope.initCache(); 
    $scope.openCloseAllModel = {};
    $scope.openCloseAllModel["list"] = $scope.cache.get("openCloseAlllist");
    $scope.openCloseAllModel["quickboard"] = $scope.cache.get("openCloseAllquickboard");
    
    $scope.openCloseAllSwitch = function(cdes, type) {
        $scope.openCloseAllModel[type] = !$scope.openCloseAllModel[type];
        $scope.cache.put("openCloseAllModel"+type, $scope.openCloseAllModel[type]);
        $scope.openCloseAll(cdes,type);
    };
    
    $scope.openCloseAll = function(cdes, type) {
        for (var i = 0; i < cdes.length; i++) {
            cdes[i].isOpen = $scope.openCloseAllModel[type];
        }        
    };

    $scope.searchByClassification = function(orgName, elts) {
        $scope.cache.removeAll();
        $scope.cacheOrgFilter(orgName);
        $scope.cache.put("selectedElements", elts);
    };
    
    $scope.screenSizeXs = screenSize.is('xs');
    
    // Retrieves orgs details from database at an interval
    GetOrgsDetailedInfo.getOrgsDetailedInfoAPI();
    $interval(function() {
        GetOrgsDetailedInfo.getOrgsDetailedInfoAPI();
    }, GLOBALS.getOrgsInterval);

}
