angular.module('cdeModule').controller('FormCdeCtrl',
    ['$scope', '$uibModal', 'CdeList', 'PinModal', function ($scope, $modal, CdeList, PinModal) {
        
            $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
                "/system/public/html/accordion/addToQuickBoardActions.html"];

            function getFormCdes() {
                CdeList.byTinyIdList($scope.formCdeIds, function (cdes) {
                    $scope.cdes = cdes;
                });
            }

            $scope.$on('loadFormCdes', getFormCdes);

            $scope.PinModal = PinModal.new('cde');


        }]);
