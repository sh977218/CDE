angular.module('formModule').controller('FormListCtrl', ['$scope', 'FormQuickBoard', '$timeout'
        , function($scope, QuickBoard, $timeout)
{

    $scope.quickBoard = QuickBoard;
    $scope.module = "form";

    $timeout(function() {
        $scope.search("form");
    }, 0);

    $scope.exporters.odm = {id: "odmExport", display: "ODM Export"};

}]);
