angular.module('cdeModule').controller('CdeDiffCtrl', ['$scope', '$http', '$uibModal', 'CdeDiff', 'CdeDiffPopulate', 'PriorCdes', function ($scope, $http, $modal, CdeDiff, CdeDiffPopulate, PriorCdes) {
    $scope.viewDiff = function (elt) {
        CdeDiff.get({deId: elt._id}, function (diffResult) {
            diffResult = diffResult.filter(function (change) {
                return change.path[3] !== "isValid";
            });
            diffResult.forEach(CdeDiffPopulate.makeHumanReadable);
            $scope.cdeDiff = diffResult;
        });
    };
    $scope.viewDiffVersion = function (elt, priorCde) {
        var modalInstance = $modal.open({
            animation: false,
            templateUrl: '/system/public/html/systemTemplate/historyCompare.html',
            controller: 'CdeDiffModalCtrl',
            resolve: {
                eltId: function () {
                    return elt._id;
                },
                priorCdeId: function () {
                    return priorCde._id;
                }
            }
        });

        modalInstance.result.then(function () {
        });
    };

    $scope.nullsToBottom = CdeDiffPopulate.nullsToBottom;

    var loadPriorCdes = function () {
        if (!$scope.priorCdes) {
            if ($scope.elt.history && $scope.elt.history.length > 0) {
                PriorCdes.getCdes({cdeId: $scope.elt._id}, function (dataElements) {
                    $scope.priorCdes = dataElements;
                });
            }
        }
    };

    $scope.$on('loadPriorCdes', loadPriorCdes);

    $scope.historyCtrlLoadedPromise.resolve();

}]);

angular.module('systemModule').controller('CdeDiffModalCtrl', ['$scope', '$http', '$uibModalInstance', 'eltId', 'priorCdeId', function ($scope, $http, $modal, eltId, priorCdeId) {
    $scope.option = {
        properties: [{label: 'version', property: 'version'}]
    };
    $http.get('/cdeById/' + eltId).then(function (result) {
        $scope.elt = result.data;
    });
    $http.get('/cdeById/' + priorCdeId).then(function (result) {
        $scope.priorCde = result.data;
    });

}]);