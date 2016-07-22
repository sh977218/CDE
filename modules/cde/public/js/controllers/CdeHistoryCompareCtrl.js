angular.module('cdeModule').controller('CdeHistoryCompareCtrl',
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




