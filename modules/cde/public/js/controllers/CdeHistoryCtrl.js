angular.module('cdeModule').controller('CdeHistoryCtrl', ['$scope', '$rootScope', '$http',
    function ($scope, $rootScope, $http) {
        $scope.showVersioned = false;
        $scope.showHistory = false;
        $scope.selectedObjs = {length: 0, selected: {}};
        $scope.selectedIds = [];

        $scope.setSelected = function (id) {
            var index = $scope.selectedIds.indexOf(id);
            if (index === -1) {
                $scope.selectedIds.splice(0, 0, id);
                if ($scope.selectedIds.length > 2) $scope.selectedIds.length = 2;
            } else {
                $scope.selectedIds.splice(index, 1);
            }
            $scope.selectedIds.sort(function (a, b) {
                return a < b;
            });
        };

        $scope.isSelected = function (id) {
            return $scope.selectedIds.indexOf(id) > -1;
        };

        $scope.viewDiff = function () {
            if ($scope.selectedIds.length === 0) {
                $scope.addAlert("danger", "Select two to compare.");
            } else {
                $scope.cdes = [];
                $rootScope.eltHistoryCompare = {};
                $scope.priorCdes.forEach(function (o) {
                    if (o._id === $scope.selectedIds[0]) {
                        $scope.cdes[0] = o;
                        $rootScope.eltHistoryCompare.left = o;
                    }
                    if (o._id === $scope.selectedIds[1]) {
                        $scope.cdes[1] = o;
                        $rootScope.eltHistoryCompare.right = o;
                    }
                });
                $scope.showHistory = true;
            }
        };

        function loadPriorCdes() {
            if (!$scope.priorCdes) {
                if ($scope.elt.history && $scope.elt.history.length > 0) {
                    $http.get('/priorcdes/' + $scope.elt._id).success(function (result) {
                        $scope.priorCdes = result.reverse();
                        $scope.priorCdes.splice(0, 0, $scope.elt);
                    });
                }
            }
        }

        $scope.$on('loadPriorCdes', loadPriorCdes);

        $scope.historyCtrlLoadedPromise.resolve();

    }]);