angular.module('cdeModule').controller('ForkCtrl', ['$scope', '$http', '$uibModal', '$window', 'userResource', '$route', '$log',
    function($scope, $http, $modal, $window, userResource, $route, $log)
{

    $scope.$on('loadForks', function() {
        if (!$scope.forks) {
            getForks();
        }
    });
    
    $scope.accept = function(id) {
        $http.post("/acceptFork", {id: id}).then(function(result) {
            if (result.data !== "") {
                $scope.addAlert("danger", "Unable to accept. This fork may have been updated. Refresh page and try again.");
            } else {
                $scope.addAlert("success", "Fork merged.");
                $route.reload();
            }
        });
    };




    $scope.forkCtrlLoadedPromise.resolve();

}]);