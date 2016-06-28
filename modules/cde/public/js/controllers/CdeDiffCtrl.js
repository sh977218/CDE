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
                elt: function () {
                    return elt;
                },
                priorCde: function () {
                    return priorCde;
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

angular.module('systemModule').controller('CdeDiffModalCtrl', ['$scope', '$http', '$timeout', '$uibModalInstance', 'elt', 'priorCde', function ($scope, $http, $timeout, $modal, elt, priorCde) {
    $scope.elt = elt;
    $scope.priorCde = priorCde;
    $scope.versionOption = {
        properties: [{label: 'Version', property: 'version'}]
    };
    $scope.nameOption = {
        properties: [
            {label: 'Name', property: 'designation'}, {
                label: 'Definition',
                property: 'definition'
            }, {label: 'Context', property: 'context.contextName'}
        ]
    };
    /*
     $scope.optionArray = [, {
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
     }];*/
}]);