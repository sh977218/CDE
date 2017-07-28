import * as exportShared from "../../../../system/shared/exportShared";
import {saveAs} from "../../../../cde/public/assets/js/FileSaver";

angular.module('cdeModule').controller('QuickBoardCtrl',
    ['$scope', 'CdeList', 'OrgHelpers', 'userResource', 'QuickBoard', 'FormQuickBoard', 'localStorageService', 'AlertService',
        function ($scope, CdeList, OrgHelpers, userResource, QuickBoard, FormQuickBoard, localStorageService, Alert) {
            $scope.quickBoard = QuickBoard;
            $scope.formQuickBoard = FormQuickBoard;
            $scope.forms = FormQuickBoard.elts;
            $scope.defaultQuickBoard = 'CDE Quickboard';
            $scope.defaultQuickBoard = localStorageService.get("defaultQuickBoard");
            $scope.showSideBySideView = false;

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
                var result = exportShared.exportHeader.cdeHeader;
                $scope.cdes.forEach(function (ele) {
                    result += exportShared.convertToCsv(ele);
                    result += "\n";
                });
                if (result) {
                    var blob = new Blob([result], {
                        type: "text/csv"
                    });
                    saveAs(blob, 'QuickBoardExport' + '.csv');
                    Alert.addAlert("success", "Export downloaded.");
                    $scope.feedbackClass = ["fa-download"];
                } else {
                    Alert.addAlert("danger", "Something went wrong, please try again in a minute.");
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
            $scope.includeInQuickBoard = ["/cde/public/html/accordion/quickBoardCompareCheckbox.html"];
        }]);

angular.module('cdeModule').controller('CdeQuickBoardCtrl',
    ['$scope', 'QuickBoard',
        function ($scope, QuickBoard) {
            $scope.module = 'cde';
            $scope.quickBoard = QuickBoard;
            $scope.cdes = QuickBoard.elts;
            $scope.elts = $scope.cdes;
            $scope.includeInButton = [];

            $scope.removeElt = function (index, $event) {
                $event.stopPropagation();
                QuickBoard.remove(index);
            };

        }]);

angular.module('cdeModule').controller('FormQuickBoardCtrl',
    ['$scope', 'FormQuickBoard',
        function ($scope, FormQuickBoard) {
            $scope.module = 'form';
            $scope.quickBoard = FormQuickBoard;
            $scope.forms = FormQuickBoard.elts;
            $scope.elts = $scope.forms;
            $scope.includeInButton = [];

            $scope.removeElt = function (index, $event) {
                $event.stopPropagation();
                FormQuickBoard.remove(index);
            };

        }]);
