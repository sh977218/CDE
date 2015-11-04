angular.module('cdeModule').controller('QuickBoardCtrl',
    ['$scope', 'CdeList', 'OrgHelpers', 'userResource', 'QuickBoard', 'FormQuickBoard', 'localStorageService',
        function ($scope, CdeList, OrgHelpers, userResource, QuickBoard, FormQuickBoard, localStorageService) {
            $scope.quickBoard = QuickBoard;
            $scope.formQuickBoard = FormQuickBoard;
            $scope.forms = FormQuickBoard.elts;
            $scope.defaultQuickBoard = 'CDE Quickboard';
            $scope.defaultQuickBoard = localStorageService.get("defaultQuickBoard");
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
            $scope.setDefaultQuickBoard = function (selectedQuickBoard) {
                localStorageService.set("defaultQuickBoard", selectedQuickBoard);
            };
            $scope.getDefaultQuickBoard = function () {
                return localStorageService.get("defaultQuickBoard");
            };

        }]);


angular.module('cdeModule').controller('CdeQuickBoardCtrl',
    ['$scope', 'QuickBoard', 'localStorageService',
        function ($scope, QuickBoard, localStorageService) {
            $scope.module = 'cde';
            $scope.quickBoard = QuickBoard;
            $scope.cdes = QuickBoard.elts;
            $scope.elts = $scope.cdes;

        }]);

angular.module('cdeModule').controller('FormQuickBoardCtrl',
    ['$scope', 'FormQuickBoard', 'localStorageService',
        function ($scope, FormQuickBoard, localStorageService) {
            $scope.module = 'form';
            $scope.quickBoard = FormQuickBoard;
            $scope.forms = FormQuickBoard.elts;
            $scope.elts = $scope.forms;
        }]);
