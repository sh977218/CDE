angular.module('cdeModule').controller('CdeHistoryCtrl', ['$scope', '$http',
    function ($scope, $http, $modal, CdeDiff) {
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

        $scope.viewDiffVersion = function () {
            if ($scope.selectedIds.length === 0) {
                $scope.addAlert("danger", "Select two to compare.");
            } else {
                $scope.showHistory = true;
            }
        };

        function loadPriorCdes() {
            if (!$scope.priorCdes) {
                if ($scope.elt.history && $scope.elt.history.length > 0) {
                    $http.get('/priorcdes/' + $scope.elt._id).success(function (result) {
                        $scope.priorCdes = result;
                        $scope.priorCdes.splice(0, 0, $scope.elt);
                    });
                }
            }
        }

        $scope.$on('loadPriorCdes', loadPriorCdes);

        $scope.historyCtrlLoadedPromise.resolve();

    }]);