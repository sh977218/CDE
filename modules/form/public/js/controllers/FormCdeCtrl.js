angular.module('cdeModule').controller('FormCdeCtrl', ['$scope', 'CdeList',
    function ($scope, CdeList) {

        $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
            "/cde/public/html/accordion/addToQuickBoardActions.html"];


        function getFormCdes() {
            CdeList.byTinyIdList($scope.formCdeIds, function (cdes) {
                $scope.cdes = cdes;
            });
        }


        $scope.$on('loadFormCdes', getFormCdes());


    }]);
