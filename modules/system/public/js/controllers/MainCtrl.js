angular.module('systemModule').controller('MainCtrl',
    ['$scope', '$modal', 'userResource', '$http', '$location', '$anchorScroll', '$timeout', '$cacheFactory', '$interval', '$window', 'screenSize', 'OrgHelpers', 'QuickBoard', '$rootScope', '$route',
        function($scope, $modal, userResource, $http, $location, $anchorScroll, $timeout, $cacheFactory, $interval, $window, screenSize, OrgHelpers, QuickBoard, $rootScope, $route) {


    $rootScope.$on("$routeChangeSuccess", function(currentRoute, previousRoute){
        $rootScope.title = 'NIH CDE Repository';
        if ($route.current.title) $rootScope.title +=  " | " + $route.current.title;
    });

    $scope.quickBoard = QuickBoard;
    QuickBoard.restoreFromLocalStorage();

    // Global variables
    var GLOBALS = {
        getOrgsInterval : 1000 * 60 * 10 // 10 min
    };

    $scope.resultPerPage = 20;

    userResource.getPromise().then(function() {
        $scope.user = userResource.user;
        $scope.myOrgs = userResource.userOrgs;
        $scope.checkMail();
    });
    
    $scope.loadMyBoards = function () {
        $http.get("/boards/" + userResource.user._id).then(function (response) {
            $scope.boards = response.data;
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

   
    userResource.getPromise().then(function() {
        $scope.loadMyBoards();
    });        

    $scope.isOrgCurator = function() {        
        return exports.isOrgCurator(userResource.user);  
    };
    
    $scope.isOrgAdmin = function() {
        return exports.isOrgAdmin(userResource.user);  
    };
    
    $scope.isSiteAdmin = function() {
        return userResource.user !== undefined && userResource.user.siteAdmin;
    };

    $scope.isDocumentationEditor = function() {
        return exports.hasRole(userResource.user, "DocumentationEditor");
    };
           
    $scope.openPinModal = function (cde) {
        var modalInstance = $modal.open({
          templateUrl: '/cde/public/html/selectBoardModal.html',
          controller: 'SelectBoardModalCtrl',
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
                    $scope.loadMyBoards();
                } else
                    $scope.addAlert("warning", response.data);
            }, function (response){
                $scope.addAlert("danger", response.data);
            });
        }, function () {
        });
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
    
   $scope.inboxVisible = function() {
       return $scope.isOrgCurator()||$scope.isOrgAdmin()||exports.hasRole($scope.user, "CommentReviewer")||exports.hasRole($scope.user, "AttachmentReviewer");
   };
    
    $scope.checkMail = function(){
        if (!$scope.inboxVisible()) return false;
        $http.get('/mailStatus').success(function(data){
            if (data.count>0) $scope.userHasMail = true;
        });
        
    };

}
]);