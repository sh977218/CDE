function ForkCtrl($scope, $http, $modal, $window) {
    
    var getForks = function() {
        $http.get("/forks/" + $scope.cde._id).then(function(result) {
           $scope.forks = result.data; 
        }); 
    };
    
    $scope.$watch('initialized', function() {
        if ($scope.initialized === true) {
            getForks();
        }
    });
    
    $scope.accept = function(id) {
        console.log("accepting: " + id);
        $http.post("/acceptFork", {id: id}).then(function(result) {
            $window.location.href = "/#/deview?cdeId=" + id;
        });
    };

    $scope.openAddFork = function() {
        var modalInstance = $modal.open({
            templateUrl: '/cde/public/html/addFork.html',
            controller: AddForkModalCtrl,
            resolve: {
                myOrgs: function() {return $scope.myOrgs}
            }
        });

        modalInstance.result.then(function (result) {
            $http.post('/dataelement/fork', {id: $scope.cde._id, org: result.org, changeNote: result.changeNote}).then(function(result) {
                getForks();
            });
        });
    };
}