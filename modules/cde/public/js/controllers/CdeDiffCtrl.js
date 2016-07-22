angular.module('cdeModule').controller('CdeDiffCtrl', ['$scope', '$http', '$uibModal', 'CdeDiff', 'CdeDiffPopulate', 'PriorCdes', function ($scope, $http, $modal, CdeDiff, CdeDiffPopulate, PriorCdes) {
    $scope.selectedObjs = {length: 0, selected: {}};
    $scope.setSelected = function (index) {
        $scope.selectedObjs.selected[index] = !$scope.selectedObjs.selected[index];
        $scope.selectedObjs.length = 0;
        for (var property in $scope.selectedObjs.selected) {
            if ($scope.selectedObjs.selected.hasOwnProperty(property) && $scope.selectedObjs.selected[property]) {
                $scope.selectedObjs.length++;
            } else {
                delete $scope.selectedObjs.selected[property];
            }
        }
        if ($scope.selectedObjs.length > 2) {
            $scope.selectedObjs.selected[index] = !$scope.selectedObjs.selected[index];
            if (!$scope.selectedObjs.selected[index])
                delete $scope.selectedObjs.selected[index];
            $scope.selectedObjs.length--;
            $scope.addAlert("danger", "You can only select two to compare.");
        }
    };
    $scope.viewDiff = function (elt) {
        CdeDiff.get({deId: elt._id}, function (diffResult) {
            diffResult = diffResult.filter(function (change) {
                return change.path[3] !== "isValid";
            });
            diffResult.forEach(CdeDiffPopulate.makeHumanReadable);
            $scope.cdeDiff = diffResult;
        });
    };

    $scope.viewDiffVersion = function () {
        if ($scope.selectedObjs.length === 0) {
            $scope.addAlert("danger", "Select two to compare.");
        } else {
            var keys = Object.keys($scope.selectedObjs.selected).sort(function (a, b) {
                if (a < 0 && b >= 0) return b > 1;
                else if (b < 0 && a > 0) return a > b;
                else return a - b;
            });
            $modal.open({
                animation: false,
                templateUrl: '/system/public/html/systemTemplate/historyCompare.html',
                controller: 'CdeDiffModalCtrl',
                resolve: {
                    left: function () {
                        if (keys[0] === "-1")
                            return angular.copy($scope.elt);
                        else return angular.copy($scope.priorCdes[parseInt(keys[0])]);
                    },
                    right: function () {
                        return angular.copy($scope.priorCdes[parseInt(keys[1])]);
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
                PriorCdes.getCdes({cdeId: $scope.elt._id}, function (dataElements) {
                    $scope.priorCdes = dataElements;
                });
            }
        }
    };

    $scope.$on('loadPriorCdes', loadPriorCdes);

    $scope.historyCtrlLoadedPromise.resolve();

}]);

angular.module('systemModule').controller('CdeDiffModalCtrl', ['$scope', '$http', '$timeout', '$uibModalInstance', 'left', 'right', 'classificationUtil', 'hideSame', function ($scope, $http, $timeout, $modal, left, right, classificationUtil, hideSame) {
    $scope.left = left;
    $scope.right = right;
    classificationUtil.sortClassification(left);
    classificationUtil.sortClassification(right);
    $scope.left.flatClassifications = classificationUtil.getFlatClassifications($scope.left);
    $scope.right.flatClassifications = classificationUtil.getFlatClassifications($scope.right);

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




