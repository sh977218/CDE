angular.module('cdeModule').controller('FormCdeCtrl', ['$scope', 'CdeList',
    function ($scope, CdeList) {

        $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
            "/cde/public/html/accordion/addToQuickBoardActions.html"];


        function getFormCdes() {
            var formCdeIds = exports.getFormCdes($scope.elt).map(function (c) {
                return c.tinyId;
            });

            CdeList.byTinyIdList(formCdeIds, function (cdes) {
                $scope.cdes = cdes;
            });
        }


        $scope.$on('loadFormCdes', getFormCdes());


    }]);
