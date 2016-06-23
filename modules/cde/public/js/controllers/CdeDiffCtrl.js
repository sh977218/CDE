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
            template: '<div ng-compare-side-by-side ng-compare-side-by-side-options="{{option}}" ng-compare-side-by-side-left={{priorCde}} ng-compare-side-by-side-right={{elt}}></div>',
            controller: 'CdeDiffModalCtrl',
            resolve: {
                elt: function () {
                    return elt;
                },
                priorCde: function () {
                    $http.get('/cdeById/' + priorCde._id).then(function (err, de) {
                        return de;
                    })
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

angular.module('systemModule').controller('CdeDiffModalCtrl', ['$scope', '$uibModalInstance', 'elt', 'priorCde', function ($scope, $modal, elt, priorCde) {
    $scope.elt = elt;
    $scope.priorCde = priorCde;
    $scope.option = {};
}]);