angular.module('articleModule', ['ngRoute', 'articleTemplates']).config(["$routeProvider",
  function($routeProvider) {
    $routeProvider
      .when('/help/:helpPage', {
        templateUrl: "/article/public/html/help.html",
        controller: 'HelpCtrl',
        controllerAs: 'help'
      })
      .when('/article/id/:id', {
        templateUrl: "/article/public/html/article.html",
        controller: 'ArticleCtrl',
        controllerAs: 'article'
      });
}])
.controller('HelpCtrl', ['$routeParams', '$http', '$scope', '$location', '$uibModal',
        function ($routeParams, $http, $scope, $location, $modal) {


    $scope.canCurate = function() {
        return $scope.isDocumentationEditor();
    };

    $scope.module = "article";
    this.destination = $routeParams.helpPage;
    $scope.elt = {};
    $scope.originalBody = {};
    $scope.elt.body = "<div ng-if='!elt'><h1 class='pt60 pb40 text-center'><i class='fa fa-spinner fa-pulse'></i> Loading...</h1></div>";
    $http.get("/article/key/" + this.destination).then(function onSuccess(response) {
        $scope.elt = response.data;
        $scope.originalBody = $scope.elt.body;
    }).catch(function onError() {
        $scope.elt = {body: "<h1>404 - Page Not Found. You have reached the unreachable.</h1>"};
    });

    $scope.edit = function() {
        $scope.editMode = true;
    };
    
    $scope.save = function() {
        $http.post("/article/key/" + $scope.elt.key, $scope.elt).then(function(result) {
            $scope.elt = result.data;
            $scope.originalBody = $scope.elt.body;
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
            animation: false,
            templateUrl: '/article/public/html/newArticleModal.html',
            controller: 'NewArticleModalCtrl',
            resolve: {
            }
        });
        modalInstance.result.then(function (newelt) {
            $location.url("help/" + newelt.key);
            $scope.addAlert("success", "Saved.");
        }, function(reason) {
            if (reason !== undefined) {
                $scope.addAlert("danger", reason);
            }
        });          
    };
}])

.controller('NewArticleModalCtrl', ['$scope', '$uibModalInstance', '$http', function($scope, $modalInstance, $http) {
    $scope.elt = {};
    $scope.ok = function() {
        $http.post("/article/key/" + $scope.elt.key, {}).then(function onSuccess(response) {
            $modalInstance.close(response.data);
        }).catch(function onError() {
            $modalInstance.dismiss("Duplicate key.");
        });
    };
    $scope.cancelSave = function() {
        $modalInstance.dismiss();
    };

}])

.controller('ArticleCtrl', ['$routeParams', '$http', '$scope', function ($routeParams, $http, $scope) {
    this.destination = $routeParams.id;
    $scope.elt = {};
    $scope.elt.body = "<div ng-if='!elt'><h1 class='pt60 pb40 text-center'><i class='fa fa-spinner fa-pulse'></i> Loading...</h1></div>";
    $http.get("/article/id/" + this.destination).then(function onSuccess(response) {
        $scope.elt = response.data;
    }).catch(function onError() {
        $scope.elt = {body: "<h1>404 - Page Not Found. You have reached the unreachable.</h1>"};
    });
}]);

