angular.module('cdeModule').controller('LinkedFormsCtrl', ['$scope', "userResource", function($scope, userResource)
{
    $scope.module = "form";

    $scope.searchSettings.q = '"' + $scope.elt.tinyId + '"';

    userResource.getPromise().then(function(){
        $scope.reload();
    });

}]);