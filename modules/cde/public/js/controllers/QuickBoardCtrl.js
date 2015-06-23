angular.module('cdeModule').controller('QuickBoardCtrl',
    ['$scope', 'CdeList', 'OrgHelpers', 'userResource', 'QuickBoard',
        function ($scope, CdeList, OrgHelpers, userResource, QuickBoard) {

            $scope.cdes = [];
            $scope.quickBoard = QuickBoard;
            $scope.showSideBySideView = false;


            $scope.removeElt = function (index) {
                QuickBoard.remove(index);
            };

            $scope.emptyQuickBoard = function () {
                QuickBoard.empty();
                $scope.cdes = [];
            };

            $scope.openCloseAll = function (cdes, type) {
                for (var i = 0; i < cdes.length; i++) {
                    cdes[i].isOpen = $scope.openCloseAllModel[type];
                }
            };

            QuickBoard.loadElts(function () {
                // TODO REFAC this. cdeAccordionList expects something called cdes.
                $scope.cdes = QuickBoard.elts;
                $scope.openCloseAll($scope.cdes, "quickboard");
            });

        }]);