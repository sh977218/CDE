angular.module('systemModule').controller('BatchUploadCtrl', ['$scope', '$http',
    function($scope, $http)
{



    $scope.$on('initBatchUpload', function() {
        $scope.loading = true;
        $http.get("/migrationCdeCount").then(function(response) {
            $scope.migrationCdeCount = response.data;
            $scope.loading = false;
        })

    });


}]);