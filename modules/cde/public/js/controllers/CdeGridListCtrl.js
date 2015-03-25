angular.module('cdeModule').controller('CdeGridListCtrl', ['$scope', 'CdeGridView', function($scope, CdeGridView) {

    $scope.gridOptions = CdeGridView.gridOptions;


    $scope.gridCdes = [];
    $scope.transformCdes = function() {
        $scope.gridCdes = [];
        var list = $scope.cdes;
        for (var i in list) {
            var cde = list[i];
            var thisCde = CdeGridView.cdeToExportCde(cde);
            $scope.gridCdes.push(thisCde);
        }
    };

    $scope.$on('elementsLoaded', function() {
        $scope.transformCdes();
    });

}]);
