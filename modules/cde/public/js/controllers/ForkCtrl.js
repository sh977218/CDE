angular.module('cdeModule').controller('ForkCtrl', ['$scope', '$http', '$modal', '$window', 'userResource', '$route',
    function($scope, $http, $modal, $window, userResource, $route) {
    
    var getForks = function() {
        $http.get("/forks/" + $scope.elt._id).then(function(result) {
           $scope.forks = result.data; 
        }); 
    };
    
    $scope.$on('loadForks', function() {
        if (!$scope.forks && $scope.elt.forks && $scope.elt.forks.length > 0) {
            getForks();
        }  else {
            $scope.forks = [];
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
            templateUrl: '/cde/public/html/cdeCopyModal.html',
            controller: 'CdeCopyModalCtrl',
            resolve: {
                elt: function() {return $scope.elt;}
            }
        });

        modalInstance.result.then(function (result) {

        });
    };
}]);