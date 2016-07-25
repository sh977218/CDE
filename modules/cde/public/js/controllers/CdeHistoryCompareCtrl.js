angular.module('cdeModule').controller('CdeHistoryCompareCtrl',
    ['$scope', '$rootScope', 'ClassificationUtil', function ($scope, $rootScope, ClassificationUtil) {
        $scope.left = $rootScope.eltHistoryCompare.left;
        $scope.right = $rootScope.eltHistoryCompare.right;
        ClassificationUtil.sortClassification($scope.left);
        ClassificationUtil.sortClassification($scope.right);
    $scope.left.flatClassifications = ClassificationUtil.flattenClassification($scope.left);
    $scope.right.flatClassifications = ClassificationUtil.flattenClassification($scope.right);

    $scope.versionOption = {
        title: 'Versions',
        hideSame: true,
        tooltip: ''
    };
    $scope.nameOption = {
        equal: function (a, b) {
            return a.designation === b.designation &&
                a.definition === b.definition &&
                a.languageCode === b.languageCode &&
                JSON.stringify(a.context) === JSON.stringify(b.context);
        },
        sort: function (a, b) {
            return a.designation - b.designation;
        },
        tooltip: 'Names are sorted by designation, compared by it\'s all properties',
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
        $scope.idsOption = {
            equal: function (a, b) {
                return JSON.stringify(a) === JSON.stringify(b);
            },
            sort: function (a, b) {
                return a.id.localeCompare(b.id);
            },
            title: 'Ids',
            hideSame: true,
            properties: [
                {label: 'Source', property: 'source'},
                {label: 'ID', property: 'id'},
                {label: 'Version', property: 'version'}
            ]
        };
    $scope.classificationOption = {
        title: 'Classifications',
        hideSame: true
    };
}]);