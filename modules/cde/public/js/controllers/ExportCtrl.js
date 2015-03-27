angular.module('cdeModule').controller('ExportCtrl', ['$scope', 'Elastic', function($scope, Elastic) {

    $scope.exportSearchResults = function() {
        $scope.query.query.size = 99999; //Number.MAX_SAFE_INTEGER;
        Elastic.getExport($scope.query, $scope.module,  function(err, result) {
            console.log(result);
        });
    };

}]);