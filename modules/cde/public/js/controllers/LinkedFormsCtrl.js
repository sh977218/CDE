angular.module('cdeModule').controller('LinkedFormsCtrl', ['$scope', "userResource", function($scope, userResource)
{
    $scope.module = "form";

    $scope.searchSettings.q = '"' + $scope.elt.tinyId + '"';

    $scope.$on('loadLinkedForms', function() {
        $scope.reload("form");
    });


}]);