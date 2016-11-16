angular.module('cdeModule').controller('FormCdeCtrl',
    ['$scope', '$uibModal', 'CdeList', 'PinModal', function ($scope, $modal, CdeList, PinModal) {
        
            $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
                "/system/public/html/accordion/addToQuickBoardActions.html"];

            function getFormCdes() {
                CdeList.byTinyIdList($scope.formCdeIds, function (cdes) {
                    $scope.cdes = cdes;

                    for (var i = 0, iForm = 0; i < $scope.cdes.length && iForm < $scope.formCdeIds.length;) {
                        var finds = $scope.cdes.filter(function (e) { return e.tinyId === $scope.formCdeIds[iForm] });
                        iForm++;
                        for (var j = 0, loc = -1; j < finds.length; j++) {
                            loc = $scope.cdes.indexOf(finds[j]);
                            if (loc !== -1 && loc >= i) {
                                if (loc > i) {
                                    var temp = $scope.cdes[i];
                                    $scope.cdes[i] = $scope.cdes[loc];
                                    $scope.cdes[loc] = temp;
                                }
                                i++;
                                break;
                            }
                        }
                    }
                });
            }

            $scope.$on('loadFormCdes', getFormCdes);

            $scope.PinModal = PinModal.new('cde');


        }]);
