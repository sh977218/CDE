function MainCtrl($scope, $modal, userResource, $http, $location, $anchorScroll, $timeout, $cacheFactory, $interval, $window, screenSize, OrgHelpers) {

    // Global variables
    var GLOBALS = {
        max_quickboard_cdes : 10
        , getOrgsInterval : 1000 * 60 * 10 * 1 // 10 min
    };
    
    $scope.resultPerPage = 20;
    $scope.loggedIn = false;
    
    $scope.isLoggedIn = function() {
        return $scope.loggedIn;
    };
    

    
//    $scope.loadUser = function() {
//        Myself.get(function(u) {
//            $scope.user = u;
//            $scope.setMyOrgs(); 
//            $scope.loadBoards();
//            $scope.userLoaded = true;
//            $scope.loggedIn = true;
//            $scope.callWhenUserLoaded.forEach(function(toCall) {
//                toCall();
//            });
//        });
//    };
    
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
        userResource.getPromise().then(function() {
            $http.get("/boards/" + $scope.user._id).then(function (response) {
                $scope.boards = response.data;
            }); 
        });        
    };

//    $scope.loadUser();    
    
    $scope.isOrgCurator = function() {        
        return $scope.isOrgAdmin() || ($scope.user && ($scope.user.orgCurator && $scope.user.orgCurator.length > 0));  
    };
    
    $scope.isOrgAdmin = function() {
        return $scope.user && (($scope.user.siteAdmin === true) || ($scope.user.orgAdmin && $scope.user.orgAdmin.length > 0));  
    };
    
    $scope.isSiteAdmin = function() {
        return $scope.user !== undefined && $scope.user.siteAdmin;
    };

    $scope.isDocumentationEditor = function() {
        return exports.hasRole($scope.user, "DocumentationEditor");
    };

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
    
    // quickBoard contains an array of CDE IDs
    $scope.quickBoard = [];
    $scope.addToQuickBoard = function(cdeId) {
        if( $scope.quickBoard.length < GLOBALS.max_quickboard_cdes ) {
            $scope.quickBoard.push(cdeId.tinyId);
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
            $http.put("/pincde/" + cde.tinyId + "/" + selectedBoard._id).then(function(response) {
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
               $scope.quickBoard.indexOf(cde.tinyId) < 0;
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

    $scope.searchByClassification = function(orgName, elts, type) {
        $scope.cache.removeAll();        
        $scope.cache.remove("search." + type + "." + "selectedOrg");
        $scope.cache.remove("search." + type + "." + "selectedElements"); 
        $scope.cache.put("search." + type + "." + "selectedOrg", orgName);   
        $scope.cache.put("search." + type + "." + "selectedElements", elts);
        $location.url('/'+type+'/search');

    };
    
    // Gets screen size and also updates it in the callboack on screen resize
    $scope.isScreenSizeXsSm = screenSize.on('xs, sm', function(isScreenSize){
        $scope.isScreenSizeXsSm = isScreenSize;
    });

    // Retrieves orgs details from database at an interval
    OrgHelpers.getOrgsDetailedInfoAPI();
    $interval(function() {
        OrgHelpers.getOrgsDetailedInfoAPI();
    }, GLOBALS.getOrgsInterval);

}
