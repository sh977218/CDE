cdeApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/help/:helpPage', {
        templateUrl: "/help/public/html/help.html",
        controller: 'HelpCtrl',
        controllerAs: 'help'
      });
}]);

cdeApp.controller('HelpCtrl', ['$routeParams', '$http', '$scope', function($routeParams, $http, $scope) {
  this.name = "HelpCtrl";
  this.destination = $routeParams.helpPage;
  $scope.helpContent = "<div ng-if='!elt'><h1 class='pt60 pb40 text-center'><i class='fa fa-spinner fa-spin'></i> Loading...</h1></div>";
  $http.get("/help/topic/" + this.destination).
        success(function(result) {
            $scope.helpContent = result;
        }).
        error(function(result) {
            $scope.helpContent = "<h1>404 - Page Not Found. You have reached the unreachable.</h1>";
        });
}]);


