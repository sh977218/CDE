angular.module('cdeModule').controller('FormCdeCtrl',
    ['$scope', '$uibModal', 'CdeList', 'PinModal', function ($scope, $modal, CdeList, PinModal) {
        
            $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
                "/system/public/html/accordion/addToQuickBoardActions.html"];

            function getFormCdes() {
                CdeList.byTinyIdList($scope.formCdeIds, function (cdes) {
                    $scope.cdes = cdes;
                    var start = 0;
                    $scope.formCdeIds.forEach(function (id, start){
                        var loc = $scope.cdes.findIndex(function (e) { return e.tinyId === id }, start);
                        if (loc !== -1) {
                            var temp = $scope.cdes[start];
                            $scope.cdes[start] = $scope.cdes[loc];
                            $scope.cdes[loc] = temp;
                            start++;
                        }
                    });
                });
            }

            $scope.$on('loadFormCdes', getFormCdes);

            $scope.PinModal = PinModal.new('cde');


        }]);
