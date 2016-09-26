angular.module('formModule').controller('FormListCtrl', ['$scope', '$controller', 'userResource', 'FormQuickBoard', '$timeout'
        , function($scope, $controller, userResource, QuickBoard, $timeout)
{

    $scope.quickBoard = QuickBoard;
    $scope.module = "form";

    $timeout(function() {
        $scope.search("form");
    }, 0);

    $scope.exporters.odm = {id: "odmExport", display: "ODM Export"};

}]);
