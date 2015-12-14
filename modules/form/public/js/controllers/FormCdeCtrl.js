angular.module('cdeModule').controller('FormCdeCtrl', ['$scope',
    function ($scope) {
        $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
            "/cde/public/html/accordion/addToQuickBoardActions.html"];
    }]);