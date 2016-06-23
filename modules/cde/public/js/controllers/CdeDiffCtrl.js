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

angular.module('systemModule').controller('CdeDiffModalCtrl', ['$scope', '$http', '$timeout', '$uibModalInstance', 'eltId', 'priorCdeId', function ($scope, $http, $timeout, $modal, eltId, priorCdeId) {
    $http.get('/cdeById/' + eltId).then(function (result) {
        $scope.elt = result.data;
        $http.get('/cdeById/' + priorCdeId).then(function (result) {
            $scope.priorCde = result.data;
            $scope.optionArray = [{
                properties: [{label: 'Version', property: 'version'}],
                left: $scope.elt.version,
                right: $scope.priorCde.version
            }, {
                properties: [
                    {label: 'Name', property: 'designation'}, {
                        label: 'Definition',
                        property: 'definition'
                    }, {label: 'Context', property: 'context.contextName'}
                ],
                left: $scope.elt.naming,
                right: $scope.priorCde.naming
            }, {
                properties: [
                    {label: 'Title', property: 'title'},
                    {label: 'URI', property: 'uri'},
                    {
                        label: 'Provider Org',
                        property: 'providerOrg'
                    },
                    {label: 'Language Code', property: 'languageCode'},
                    {label: 'Document', property: 'document'}
                ],
                left: $scope.elt.referenceDocuments,
                right: $scope.priorCde.referenceDocuments
            }, {
                properties: [
                    {label: 'Key', property: 'key'},
                    {label: 'Value', property: 'value'}
                ],
                left: $scope.elt.properties,
                right: $scope.priorCde.properties
            }];
        });
    });

}]);