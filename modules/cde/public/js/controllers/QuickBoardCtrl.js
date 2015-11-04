angular.module('cdeModule').controller('QuickBoardCtrl',
    ['$scope', 'CdeList', 'OrgHelpers', 'userResource', 'QuickBoard', 'FormQuickBoard',
        function ($scope, CdeList, OrgHelpers, userResource, QuickBoard, FormQuickBoard) {

            $scope.quickBoard = QuickBoard;
            $scope.formQuickBoard = FormQuickBoard;
            $scope.forms = FormQuickBoard.elts;

            $scope.showSideBySideView = false;

            $scope.removeElt = function (index) {
                QuickBoard.remove(index);
            };

            $scope.openCloseAll = function (elts, type) {
                for (var i = 0; i < elts.length; i++) {
                    elts[i].isOpen = $scope.openCloseAllModel[type];
                }
            };
            $scope.openCloseAll(QuickBoard.elts, "quickboard");

        }]);


angular.module('cdeModule').controller('CdeQuickBoardCtrl',
    ['$scope', 'QuickBoard',
        function ($scope, QuickBoard) {

            $scope.module = 'cde';
            $scope.quickBoard = QuickBoard;
            $scope.cdes = QuickBoard.elts;



        }]);

angular.module('cdeModule').controller('FormQuickBoardCtrl',
    ['$scope', 'FormQuickBoard',
        function ($scope, FormQuickBoard) {

            $scope.module = 'form';
            $scope.quickBoard = FormQuickBoard;
            $scope.forms = FormQuickBoard.elts;

        }]);
