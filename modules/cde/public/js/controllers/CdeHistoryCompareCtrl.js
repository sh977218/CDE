angular.module('cdeModule').controller('CdeHistoryCompareCtrl',
    ['$scope', '$rootScope', 'ClassificationUtil', function ($scope, $rootScope, ClassificationUtil) {
        $scope.left = $rootScope.eltHistoryCompare.left;
        $scope.right = $rootScope.eltHistoryCompare.right;
        ClassificationUtil.sortClassification($scope.left);
        ClassificationUtil.sortClassification($scope.right);
        $scope.left.flatClassifications = ClassificationUtil.flattenClassification($scope.left);
        $scope.right.flatClassifications = ClassificationUtil.flattenClassification($scope.right);

        $scope.versionOptions = {
            title: 'Versions',
            hideSame: true,
            tooltip: ''
        };
        $scope.statusOptions = {
            title: 'Status',
            hideSame: true,
            tooltip: ''
        };
        $scope.stewardOrgNameOptions = {
            title: 'StewardOrg Name',
            hideSame: true,
            tooltip: ''
        };
        $scope.namingOptions = {
            equal: function (a, b) {
                return a.designation === b.designation &&
                    a.definition === b.definition &&
                    a.languageCode === b.languageCode &&
                    a.context.acceptability === b.context.acceptability &&
                    a.context.contextName === b.context.contextName;
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
        $scope.dataElementConceptOptions = {
            equal: function (a, b) {
                return a.name === b.name &&
                    a.origin === b.origin &&
                    a.originId === b.originId;
            },
            sort: function (a, b) {
                return a.name - b.name;
            },
            tooltip: 'dataElementConcept are sorted by name, compared by it\'s all properties',
            title: 'Concept',
            hideSame: true,
            properties: [
                {label: 'Name', property: 'name'}, {
                    label: 'Origin',
                    property: 'origin'
                }, {label: 'OriginId', property: 'originId'}
            ]
        };
        $scope.propertyConceptOptions = {
            equal: function (a, b) {
                return a.name === b.name &&
                    a.origin === b.origin &&
                    a.originId === b.originId;
            },
            sort: function (a, b) {
                return a.name - b.name;
            },
            tooltip: 'propertyConcept are sorted by name, compared by it\'s all properties',
            title: 'Property Concept',
            hideSame: true,
            properties: [
                {label: 'Name', property: 'name'}, {
                    label: 'Origin',
                    property: 'origin'
                }, {label: 'OriginId', property: 'originId'}
            ]
        };
        $scope.objectClassConceptOptions = {
            equal: function (a, b) {
                return a.name === b.name &&
                    a.origin === b.origin &&
                    a.originId === b.originId;
            },
            sort: function (a, b) {
                return a.name - b.name;
            },
            tooltip: 'objectClassConcept are sorted by name, compared by it\'s all properties',
            title: 'ObjectClass Concept',
            hideSame: true,
            properties: [
                {label: 'Name', property: 'name'}, {
                    label: 'Origin',
                    property: 'origin'
                }, {label: 'OriginId', property: 'originId'}
            ]
        };
        $scope.referenceDocumentsOptions = {
            equal: function (a, b) {
                return a.title === b.title;
            },
            sort: function (a, b) {
                return a.title - b.title;
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
        $scope.propertiesOptions = {
            equal: function (a, b) {
                return a.key === b.key;
            },
            sort: function (a, b) {
                return a.key - b.key;
            },
            title: 'Properties',
            hideSame: true,
            properties: [
                {label: 'Key', property: 'key'},
                {label: 'Value', property: 'value'}
            ]
        };
        $scope.idsOptions = {
            equal: function (a, b) {
                return a.id === b.id &&
                    a.source === b.source &&
                    a.version === b.version;
            },
            sort: function (a, b) {
                return a.id - b.id;
            },
            title: 'IDs',
            hideSame: true,
            properties: [
                {label: 'Source', property: 'source'},
                {label: 'ID', property: 'id'},
                {label: 'Version', property: 'version'}
            ]
        };
        $scope.classificationsOptions = {
            title: 'Classifications',
            hideSame: true
        };
        $scope.valueDomainDatatypeOptions = {
            title: 'Value Type',
            hideSame: true,
            tooltip: ''
        };
        var datatypeCompareMap = {
            'Value List': {
                obj: 'permissibleValues', options: {
                    equal: function (a, b) {
                        return a.permissibleValue === b.permissibleValue &&
                            a.valueMeaningName === b.valueMeaningName &&
                            a.valueMeaningCode === b.valueMeaningCode &&
                            a.valueMeaningDefinition === b.valueMeaningDefinition &&
                            a.codeSystemName === b.codeSystemName;
                    },
                    sort: function (a, b) {
                        return a.permissibleValue - b.permissibleValue;
                    },
                    title: 'Data Type Value List', hideSame: false,
                    properties: [{label: 'Value', property: 'permissibleValue'},
                        {label: 'Code Name', property: 'valueMeaningName'},
                        {label: 'Code', property: 'valueMeaningCode'},
                        {label: 'Code System', property: 'valueMeaningDefinition'},
                        {label: 'Code Description', property: 'codeSystemName'}],
                    tooltip: ''
                }
            },
            'Text': {
                obj: 'datatypeText', options: {
                    title: 'Data Type Text', hideSame: false,
                    properties: [{label: 'Minimum Length', property: 'minLength'}, {
                        label: 'Maximum Length',
                        property: 'maxLength'
                    }, {label: 'Regular Expression', property: 'regex'}, {label: 'Free text rule', property: 'rule'}],
                    tooltip: ''
                }
            },
            'Date': {
                obj: 'datatypeDate',
                options: {
                    title: 'Data Type Date', hideSame: false,
                    properties: [{label: 'Date Format', property: 'format'}],
                    tooltip: ''
                }
            },
            'Time': {
                obj: 'datatypeTime',
                options: {
                    title: 'Data Type Time', hideSame: false,
                    properties: [{label: 'Date Format', property: 'format'}],
                    tooltip: ''
                }
            },
            'Number': {
                obj: 'datatypeNumber', options: {
                    title: 'Data Type Number', hideSame: false,
                    properties: [{label: 'Minimum Value', property: 'minValue'}, {
                        label: 'Maximum Value',
                        property: 'maxValue'
                    }, {label: 'Precision', property: 'precision'}],
                    tooltip: ''
                }
            },
            'datatypeExternallyDefined': ''
        };

        $scope.leftDatatypeObj = {
            obj: $scope.left.valueDomain[datatypeCompareMap[$scope.left.valueDomain.datatype].obj],
            p: datatypeCompareMap[$scope.left.valueDomain.datatype].options
        };
        $scope.rightDatatypeObj = {
            obj: $scope.right.valueDomain[datatypeCompareMap[$scope.right.valueDomain.datatype].obj],
            p: datatypeCompareMap[$scope.right.valueDomain.datatype].options
        };
    }
    ]);