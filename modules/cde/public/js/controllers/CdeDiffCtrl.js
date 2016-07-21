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
        var eltCopy = angular.copy(elt);
        var priorCdeCopy = angular.copy(priorCde);
        var modalInstance = $modal.open({
            animation: false,
            templateUrl: '/system/public/html/systemTemplate/historyCompare.html',
            controller: 'CdeDiffModalCtrl',
            resolve: {
                elt: function () {
                    return eltCopy;
                },
                priorCde: function () {
                    return priorCdeCopy;
                },
                hideSame: function () {
                    return $scope.hideSame;
                }
            }
        });

        modalInstance.result.then(function () {
        });
    };

    $scope.nullsToBottom = CdeDiffPopulate.nullsToBottom;

    function loadPriorCdes() {
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

angular.module('systemModule').controller('CdeDiffModalCtrl', ['$scope', '$http', '$timeout', '$uibModalInstance', 'elt', 'priorCde', 'classificationUtil', 'hideSame', function ($scope, $http, $timeout, $modal, elt, priorCde, classificationUtil, hideSame) {
    $scope.elt = elt;
    $scope.priorCde = priorCde;
    classificationUtil.sortClassification(elt);
    classificationUtil.sortClassification(priorCde);
    $scope.elt.flatClassifications = classificationUtil.getFlatClassifications($scope.elt);
    $scope.priorCde.flatClassifications = classificationUtil.getFlatClassifications($scope.priorCde);

    $scope.versionOption = {
        title: 'Versions',
        hideSame: true
    };
    $scope.nameOption = {
        equal: function (a, b) {
            return a.designation === b.designation;
        },
        sort: function (a, b) {
            return a.designation.localeCompare(b.designation);
        },
        title: 'Names',
        hideSame: true,
        properties: [
            {label: 'Name', property: 'designation'}, {
                label: 'Definition',
                property: 'definition'
            }, {label: 'Context', property: 'context.contextName'}
        ]
    };
    $scope.referenceDocumentOption = {
        equal: function (a, b) {
            return a.title === b.title;
        },
        sort: function (a, b) {
            return a.title.localeCompare(b.title);
        },
        title: 'Reference Documents',
        hideSame: true,
        properties: [
            {label: 'Title', property: 'title'},
            {label: 'URI', property: 'uri'},
            {
                label: 'Provider Org',
                property: 'providerOrg'
            },
            {label: 'Language Code', property: 'languageCode'},
            {label: 'Document', property: 'document'}
        ]
    };
    $scope.propertiesOption = {
        equal: function (a, b) {
            return a.key === b.key;
        },
        sort: function (a, b) {
            return a.key.localeCompare(b.key);
        },
        title: 'Properties',
        hideSame: true,
        properties: [
            {label: 'Key', property: 'key'},
            {label: 'Value', property: 'value'}
        ]
    };
    $scope.classificationOption = {
        title: 'Classifications',
        hideSame: true
    };
}]);




