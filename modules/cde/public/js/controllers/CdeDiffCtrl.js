angular.module('cdeModule').controller('CdeDiffCtrl', ['$scope', '$http', '$uibModal', 'CdeDiff', 'CdeDiffPopulate',
    function ($scope, $http, $modal, CdeDiff, CdeDiffPopulate) {
    $scope.selectedObjs = {length: 0, selected: {}};
    $scope.selectedIds = [];

    $scope.setSelected = function (id)  {
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

    $scope.isSelected = function(id) {return $scope.selectedIds.indexOf(id) > -1;};

    $scope.viewDiffVersion = function () {
        if ($scope.selectedIds.length === 0) {
            $scope.addAlert("danger", "Select two to compare.");
        } else {
            $modal.open({
                animation: false,
                templateUrl: '/system/public/html/systemTemplate/historyCompare.html',
                controller: 'CdeDiffModalCtrl',
                resolve: {
                    left: function () {
                        return angular.copy($scope.priorCdes.filter(function (a) {
                            return a._id === $scope.selectedIds[0];
                        })[0]);
                    },
                    right: function () {
                        return angular.copy($scope.priorCdes.filter(function (a) {
                            return a._id === $scope.selectedIds[1];
                        })[0]);
                    },
                    hideSame: function () {
                        return $scope.hideSame;
                    }
                }
            }).result.then(function () {
            });
        }
    };

    $scope.nullsToBottom = CdeDiffPopulate.nullsToBottom;

    function loadPriorCdes() {
        if (!$scope.priorCdes) {
            if ($scope.elt.history && $scope.elt.history.length > 0) {
                $http.get('/priorcdes/' + $scope.elt._id).success(function(result) {
                    $scope.priorCdes = result;
                    $scope.priorCdes.splice(0, 0, $scope.elt);
                });
            }
        }
    }

    $scope.$on('loadPriorCdes', loadPriorCdes);

    $scope.historyCtrlLoadedPromise.resolve();

}]);

angular.module('systemModule').controller('CdeDiffModalCtrl',
    ['$scope', '$http', '$timeout', '$uibModalInstance', 'left', 'right', 'ClassificationUtil',
        function ($scope, $http, $timeout, $modal, left, right, ClassificationUtil) {
    $scope.left = left;
    $scope.right = right;
    ClassificationUtil.sortClassification(left);
    ClassificationUtil.sortClassification(right);
    $scope.left.flatClassifications = ClassificationUtil.flattenClassification($scope.left);
    $scope.right.flatClassifications = ClassificationUtil.flattenClassification($scope.right);

    $scope.versionOption = {
        title: 'Versions',
        hideSame: true,
        tooltip: ''
    };
    $scope.nameOption = {
        equal: function (a, b) {
            return a.designation === b.designation;
        },
        sort: function (a, b) {
            return a.designation.localeCompare(b.designation);
        },
        tooltip: 'Names are sorted by designation, compared by designation',
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




