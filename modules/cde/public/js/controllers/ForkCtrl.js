systemModule.controller('ForkCtrl', ['$scope', '$http', '$modal', '$window', 'userResource', function($scope, $http, $modal, $window, userResource) {
    
    var getForks = function() {
        $http.get("/forks/" + $scope.elt._id).then(function(result) {
           $scope.forks = result.data; 
        }); 
    };
    
    $scope.$watch('elt', function() {
        if ($scope.elt !== undefined ) {
            getForks();
        }
    });
    
    $scope.accept = function(id) {
        $http.post("/acceptFork", {id: id}).then(function(result) {
            if (result.data !== "") {
                $scope.addAlert("danger", "Unable to accept. This fork may have been updated. Refresh page and try again.");
            } else {
                $scope.addAlert("success", "Fork merged.")
                $window.location.href = "/#/deview?cdeId=" + id;
            }
        });
    };

    $scope.openAddFork = function() {
        var modalInstance = $modal.open({
            templateUrl: '/cde/public/html/addFork.html',
            controller: AddForkModalCtrl,
            resolve: {
                userResource: function() {return userResource}
            }
        });

        modalInstance.result.then(function (result) {
            $http.post('/dataelement/fork', {id: $scope.elt._id, org: result.org, changeNote: result.changeNote}).then(function(result) {
                getForks();
            });
        });
    };
}]);