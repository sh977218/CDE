cdeApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/help/:helpPage', {
        templateUrl: "/help/public/html/help.html",
        controller: 'HelpCtrl',
        controllerAs: 'help'
      });

}]);

cdeApp.controller('HelpCtrl', ['$routeParams', function($routeParams) {
  this.name = "HelpCtrl";
  this.destination = $routeParams.helpPage;
}]);

