angular.module('cdeModule').controller('LinkedFormsCtrl', ['$scope', "$interval", "FormQuickBoard", "PinModal",
    function($scope, $interval, QuickBoard, PinModal)
{

    $scope.module = "form";
    $scope.quickBoard = QuickBoard;

    $scope.searchSettings.q = '"' + $scope.elt.tinyId + '"';

    $scope.$on('loadLinkedForms', function() {
        $scope.$parent.took = null;
        $scope.reload("form");

        var finishLoadLinkedForms = $interval(function () {
            if ($scope.took) {
                $interval.cancel(finishLoadLinkedForms);
                var searchterm = $scope.currentSearchTerm.slice(1, -1);
                var self = $scope.forms.filter(function (elt) {
                    return elt.tinyId === searchterm;
                });
                if (self.length)
                    $scope.forms.splice($scope.forms.indexOf(self[0]), 1);
            }
        }, 0);
    });

    $scope.PinModal = PinModal.new('form');

    $scope.includeInAccordion = [
        "/cde/public/html/accordion/pinAccordionActions.html",
        "/system/public/html/accordion/addToQuickBoardActions.html"
    ];

    $scope.getFormText = function() {
        if ($scope.$parent.module === "cde") {
            if (!$scope.forms || $scope.forms.length === 0) {
                return "There are no forms that use this CDE.";
            }
            else if ($scope.forms.length === 1) {
                return "There is 1 form that uses this CDE.";
            }
            else if ($scope.forms.length >= 20) {
                return "There are more than 20 forms that use this CDE.";
            }
            else {
                return "There are " + $scope.forms.length + " that use this CDE.";
            }
        }
        if ($scope.$parent.module === "form") {
            if (!$scope.forms || $scope.forms.length === 0) {
                return "There are no forms that use this form.";
            }
            else if ($scope.forms.length === 1) {
                return "There is 1 form that uses this form.";
            }
            else if ($scope.forms.length >= 20) {
                return "There are more than 20 forms that use this form.";
            }
            else {
                return "There are " + $scope.forms.length + " that use this form.";
            }
        }
    };

    $scope.formsCtrlLoadedPromise.resolve();

    $scope.cutoffIndex = 20;

}]);