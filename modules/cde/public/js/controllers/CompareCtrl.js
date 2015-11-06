angular.module('cdeModule').controller('CompareCtrl',
    ['$scope', 'QuickBoard',
        function ($scope, QuickBoard) {
            $scope.compareView = true;
            $scope.pvLimit = 30;

            $scope.initCache();
            $scope.openAllCompareModel = $scope.cache.get("openAllCompare");
            $scope.quickBoard = QuickBoard;

            $scope.openAllCompare = function (newValue) {
                $scope.openAllCompareModel = newValue;

                for (var i = 0; i < $scope.cdes.length; i++) {
                    $scope.cdes[i].isOpen = $scope.openAllCompareModel;
                }
                $scope.cache.put("openAllCompare", $scope.openAllCompareModel);
            };

            $scope.canCurate = false;

            function lowerCompare(item1, item2) {
                if (item1 === undefined && item2 === undefined) {
                    return true;
                } else if (item1 === undefined || item2 === undefined) {
                    return false;
                } else {
                    return item1.toLowerCase() === item2.toLowerCase();
                }
            }

            $scope.isPvInList = function (pv, list, callback) {
                for (var i = 0; i < list.length; i++) {
                    if (lowerCompare(pv.permissibleValue, list[i].permissibleValue) &&
                        pv.valueMeaningCode === list[i].valueMeaningCode &&
                        pv.codeSystemName === list[i].codeSystemName &&
                        lowerCompare(pv.valueMeaningName, list[i].valueMeaningName)) {
                        return callback(true);
                    }
                }
                return callback(false);
            };

            $scope.comparePvs = function (list1, list2) {
                for (var i = 0; i < list1.length; i++) {
                    $scope.isPvInList(list1[i], list2, function (wellIsIt) {
                        list1[i].isValid = wellIsIt;
                    });
                }
            };

            var wipeUseless = function (toWipeCde) {
                delete toWipeCde._id;
                delete toWipeCde.history;
                delete toWipeCde.imported;
                delete toWipeCde.created;
                delete toWipeCde.createdBy;
                delete toWipeCde.updated;
                delete toWipeCde.comments;
                delete toWipeCde.registrationState;
                delete toWipeCde.tinyId;
            };

            var elt1 = JSON.parse(JSON.stringify($scope.eltsToCompare[0]));
            var elt2 = JSON.parse(JSON.stringify($scope.eltsToCompare[1]));
            wipeUseless(elt1);
            wipeUseless(elt2);
            var diff = DeepDiff(elt1, elt2);

            $scope.cdes = QuickBoard.elts;
            $scope.comparePvs($scope.cdes[1].valueDomain.permissibleValues, $scope.cdes[0].valueDomain.permissibleValues);
            $scope.comparePvs($scope.cdes[0].valueDomain.permissibleValues, $scope.cdes[1].valueDomain.permissibleValues);


        }]);