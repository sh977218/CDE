angular.module('cdeModule').controller('ForkCtrl', ['$scope', '$http', '$uibModal', '$window', 'userResource', '$route', '$log',
    function($scope, $http, $modal, $window, userResource, $route, $log)
{


    var getForks = function() {
        $http.get("/forks/" + $scope.elt._id).then(function(result) {
           $scope.forks = result.data;

        }, function (err) {
            $log.error("unable to retrieve forks. " + $scope.elt.tinyId);
            $scope.addAlert("There was an issue retrieving forks for this element. ");
            $log.error(err);
        });
    };
    
    $scope.$on('loadForks', function() {
        $log.debug("load fork event " + $scope.elt.tinyId);
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

    $scope.openAddFork = function() {
        var modalInstance = $modal.open({
            animation: false,
            templateUrl: '/cde/public/html/addFork.html',
            controller: 'AddForkModalCtrl',
            resolve: {
                userResource: function() {return userResource}
            }
        });

        modalInstance.result.then(function (result) {
            $http.post('/dataelement/fork', {id: $scope.elt._id, org: result.org, changeNote: result.changeNote}).then(function() {
                getForks();
            });
        });
    };

    $scope.openCdeCopyModal = function() {
        var modalInstance = $modal.open({
            animation: false,
            templateUrl: '/cde/public/html/cdeCopyModal.html',
            controller: 'CdeCopyModalCtrl',
            resolve: {
                elt: function() {return $scope.elt;}
            }
        });

        modalInstance.result.then(function (result) {

        });
    };

    $scope.forkCtrlLoadedPromise.resolve();

}]);