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
                $scope.eltsToCompareMap = {};
                localStorageService.set("defaultQuickBoard", selectedQuickBoard);
            };
            $scope.tabs = {
                cdeQuickBoard: {},
                formQuickBoard: {}
            };
            if (localStorageService.get("defaultQuickBoard")) {
                try {
                    $scope.tabs[localStorageService.get("defaultQuickBoard")].active = true;
                } catch (e) {
                    localStorageService.remove("defaultQuickBoard");
                }
            }

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
            };
            $scope.eltsToCompareMap = {};
            $scope.checkboxClick = function (elt, $event) {
                if ($scope.eltsToCompareMap[elt.tinyId])
                    delete $scope.eltsToCompareMap[elt.tinyId];
                else {
                    $scope.eltsToCompareMap[elt.tinyId] = elt;
                }
                $event.stopPropagation();
            };
            $scope.includeInAccordion = ["/cde/public/html/accordion/quickBoardAccordionActions.html"];
        }]);

angular.module('cdeModule').controller('CdeQuickBoardCtrl',
    ['$scope', 'QuickBoard',
        function ($scope, QuickBoard) {
            $scope.module = 'cde';
            $scope.quickBoard = QuickBoard;
            $scope.cdes = QuickBoard.elts;
            $scope.elts = $scope.cdes;
            $scope.includeInButton = [];
        }]);

angular.module('cdeModule').controller('FormQuickBoardCtrl',
    ['$scope', 'FormQuickBoard',
        function ($scope, FormQuickBoard) {
            $scope.module = 'form';
            $scope.quickBoard = FormQuickBoard;
            $scope.forms = FormQuickBoard.elts;
            $scope.elts = $scope.forms;
            $scope.includeInButton = [];
        }]);
