angular.module('formModule').controller('FormListCtrl',
    ['$scope', 'FormQuickBoard', '$timeout', 'PinModal', function ($scope, QuickBoard, $timeout, PinModal) {

    $scope.quickBoard = QuickBoard;
    $scope.module = "form";

    $timeout(function () {
        $scope.search("form");
    }, 0);

    $scope.exporters.odm = {id: "odmExport", display: "ODM Export"};

    $scope.PinModal = PinModal.new('form');


    $scope.includeInAccordion = [
        "/cde/public/html/accordion/pinAccordionActions.html",
        "/system/public/html/accordion/addToQuickBoardActions.html"
    ];


}]);
