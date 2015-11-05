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
            $scope.tabs = {
                cdeQuickBoard: {
                    heading: "CDE Quickboard (" + $scope.quickBoard.numberDisplay() + ")",
                    active: $scope.getDefaultQuickBoard() === 'CDE Quickboard' ? true : false
                },
                formQuickBoard: {
                    heading: "Form Quickboard (" + $scope.quickBoard.numberDisplay() + ")",
                    active: $scope.getDefaultQuickBoard() === 'Form Quickboard' ? true : false
                }
            };
            $scope.exportQuickBoard = function () {
                var result = exports.exportHeader.cdeHeader;
                $scope.cdes.forEach(function (ele) {
                    result += exports.convertToCsv(ele);
                });
                if (result) {
                    var blob = new Blob([result], {
                        type: "text/csv"
                    });
                    saveAs(blob, 'QuickBoardExport' + '.csv');
                    $scope.addAlert("success", "Export downloaded.");
                    $scope.feedbackClass = ["fa-download"];
                } else {
                    $scope.addAlert("danger", "Something went wrong, please try again in a minute.");
                }
            }
        }]);
angular.module('cdeModule').controller('CdeQuickBoardCtrl',
    ['$scope', 'QuickBoard',
        function ($scope, QuickBoard) {
            $scope.module = 'cde';
            $scope.quickBoard = QuickBoard;
            $scope.cdes = QuickBoard.elts;
            $scope.elts = $scope.cdes;

        }]);

angular.module('cdeModule').controller('FormQuickBoardCtrl',
    ['$scope', 'FormQuickBoard',
        function ($scope, FormQuickBoard) {
            $scope.module = 'form';
            $scope.quickBoard = FormQuickBoard;
            $scope.forms = FormQuickBoard.elts;
            $scope.elts = $scope.forms;
        }]);
