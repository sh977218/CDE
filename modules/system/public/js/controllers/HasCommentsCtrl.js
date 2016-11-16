angular.module('systemModule').controller('HasCommentsCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.deferredEltLoaded.promise.then(function() {
        $http.get('/comments/eltId/' + $scope.getEltId()).then(function (result) {
            $scope.hasComments = result && result.data && result.data.length > 0;
        });
    });
}]);
