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

    this.name = "HelpCtrl";
    this.destination = $routeParams.helpPage;
    $scope.article = {};
    $scope.originalBody = {};
    $scope.article.body = "<div ng-if='!elt'><h1 class='pt60 pb40 text-center'><i class='fa fa-spinner fa-spin'></i> Loading...</h1></div>";
    $http.get("/article/" + this.destination).
            success(function (result) {
                $scope.article = result;
                $scope.originalBody = $scope.article.body;
            }).
            error(function (result) {
                $scope.article = {body: "<h1>404 - Page Not Found. You have reached the unreachable.</h1>"};
            });

    $scope.edit = function() {
        $scope.editMode = true;
    };
    
    $scope.save = function() {
        $http.post("/article/" + $scope.article.key, $scope.article).then(function(result) {
            $scope.addAlert("success", "Saved.");
            delete $scope.editMode;
        });
    };

    $scope.cancel = function() {
        delete $scope.editMode;
        $scope.article.body = $scope.originalBody;
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


}]);

cdeApp.controller('NewArticleModalCtrl', ['$scope', '$modalInstance', '$http', function($scope, $modalInstance, $http) {

    $scope.article = {};

    $scope.ok = function() {
        $http.post("/article/" + $scope.article.key, {}).
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

