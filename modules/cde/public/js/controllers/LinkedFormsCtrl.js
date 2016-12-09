angular.module('cdeModule').controller('LinkedFormsCtrl', ['$scope', "userResource", function($scope)
{
    $scope.module = "form";

    $scope.searchSettings.q = '"' + $scope.elt.tinyId + '"';

    $scope.$on('loadLinkedForms', function() {
        $scope.reload("form");
    });

    $scope.includeInAccordion = [
        "/cde/public/html/accordion/pinAccordionActions.html",
        "/system/public/html/accordion/addToQuickBoardActions.html"
    ];

    $scope.getFormText = function() {
        if (!$scope.forms || $scope.forms.length === 0) {return "There are no forms that use this CDE.";}
        else if ($scope.forms.length === 1) {return "There is 1 form that uses this CDE.";}
        else if ($scope.forms.length >= 20) {return "There are more than 20 forms that use this CDE.";}
        else {return "There are " + $scope.forms.length + " that use this CDE.";}
    };

    $scope.formsCtrlLoadedPromise.resolve();

    $scope.cutoffIndex = 20;

}]);