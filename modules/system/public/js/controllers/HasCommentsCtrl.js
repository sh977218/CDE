angular.module('systemModule').controller('HasCommentsCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.deferredEltLoaded.promise.then(function() {
        $http.get('/comments/eltId/' + $scope.getEltId()).then(function onSuccess(response) {
            $scope.hasComments = response.data.length > 0;
        }).catch(function onError() {});
    });
}]);
