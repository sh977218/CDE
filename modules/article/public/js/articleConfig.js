cdeApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/help/:helpPage', {
        templateUrl: "/article/public/html/help.html",
        controller: 'HelpCtrl',
        controllerAs: 'help'
      });
}]);

cdeApp.controller('HelpCtrl', ['$routeParams', '$http', '$scope', '$window', '$modal', 
        function ($routeParams, $http, $scope, $window, $modal) {


    $scope.module = "article";
    this.destination = $routeParams.helpPage;
    $scope.elt = {};
    $scope.originalBody = {};
    $scope.elt.body = "<div ng-if='!elt'><h1 class='pt60 pb40 text-center'><i class='fa fa-spinner fa-spin'></i> Loading...</h1></div>";
    $http.get("/article/" + this.destination).
            success(function (result) {
                $scope.elt = result;
                $scope.originalBody = $scope.elt.body;
            }).
            error(function (result) {
                $scope.elt = {body: "<h1>404 - Page Not Found. You have reached the unreachable.</h1>"};
            });

    $scope.edit = function() {
        $scope.editMode = true;
    };
    
    $scope.save = function() {
        $http.post("/article/" + $scope.elt.key, $scope.elt).then(function(result) {
            $scope.addAlert("success", "Saved.");
            delete $scope.editMode;
        });
    };

    $scope.cancel = function() {
        delete $scope.editMode;
        $scope.elt.body = $scope.originalBody;
    };


    $scope.openNewArticleModal = function() {
        var modalInstance = $modal.open({
            templateUrl: '/article/public/html/newArticleModal.html',
            controller: 'NewArticleModalCtrl',
            resolve: {
            }
        });
        modalInstance.result.then(function (newelt) {
            $window.location.href = "/#/help/" + newelt.key;
            $scope.addAlert("success", "Saved.");
        });          
    };

    $scope.canDoNonCuration = function() {
        $scope.isDocumentationEditor();
    };

}]);

cdeApp.controller('NewArticleModalCtrl', ['$scope', '$modalInstance', '$http', function($scope, $modalInstance, $http) {

    $scope.elt = {};

    $scope.ok = function() {
        $http.post("/article/" + $scope.elt.key, {}).
                success(function(newArticle) {                      
                    $modalInstance.close(newArticle);
                }).
                error(function() {
                    $scope.addAlert("Duplicate key.");
                });
    };

    $scope.cancelSave = function() {
        $modalInstance.dismiss('cancel');
    };

}]);

