angular.module('cdeModule').controller('FormCdeCtrl',
    ['$scope', '$uibModal', 'CdeList', 'PinModal', function ($scope, $modal, CdeList, PinModal) {
        
            $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
                "/system/public/html/accordion/addToQuickBoardActions.html"];

            function getFormCdes() {
                CdeList.byTinyIdList($scope.formCdeIds, function (cdes) {
                    $scope.cdes = cdes;
                    $scope.formCdeIds.forEach(function (id, index){
                        var finds = $scope.cdes.filter(function (e) { return e.tinyId === id });
                        var loc = -1;
                        for (var i = 0; i < finds.length; i++) {
                            loc = $scope.cdes.indexOf(finds[i]);
                            if(loc >= index) break;
                        }
                        if (loc !== -1 && loc > index) {
                            var temp = $scope.cdes[index];
                            $scope.cdes[index] = $scope.cdes[loc];
                            $scope.cdes[loc] = temp;
                        }
                    });
                });
            }

            $scope.$on('loadFormCdes', getFormCdes);

            $scope.PinModal = PinModal.new('cde');


        }]);
