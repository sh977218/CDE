angular.module('cdeModule').controller('CdeHistoryCtrl', ['$scope', 'ClassificationUtil',
    function ($scope, ClassificationUtil) {
        $scope.showVersioned = false;
        $scope.showHistory = false;
        $scope.selectedObjs = {length: 0, selected: {}};
        $scope.selectedIds = [];

        $scope.setSelected = function (id) {
            $scope.showHistory = false;
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

        $scope.isSelected = function (id) {
            return $scope.selectedIds.indexOf(id) > -1;
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

        $scope.viewDiff = function () {
            if ($scope.selectedIds.length === 0) {
                $scope.addAlert("danger", "Select two to compare.");
            } else {
                $scope.priorCdes.forEach(function (o) {
                    if (o._id === $scope.selectedIds[0]) {
                        $scope.left = o;
                    }
                    if (o._id === $scope.selectedIds[1]) {
                        $scope.right = o;
                    }
                });
                $scope.showHistory = true;
                $scope.leftCopy = angular.copy($scope.left);
                $scope.rightCopy = angular.copy($scope.right);
                ClassificationUtil.sortClassification($scope.leftCopy);
                ClassificationUtil.sortClassification($scope.rightCopy);
                $scope.leftCopy.flatClassifications = ClassificationUtil.flattenClassification($scope.leftCopy);
                $scope.rightCopy.flatClassifications = ClassificationUtil.flattenClassification($scope.rightCopy);


                if (datatypeCompareMap[$scope.leftCopy.valueDomain.datatype]) {
                    $scope.leftDatatypeObj = {
                        obj: $scope.leftCopy.valueDomain[datatypeCompareMap[$scope.leftCopy.valueDomain.datatype].obj],
                        p: datatypeCompareMap[$scope.leftCopy.valueDomain.datatype].options
                    };
                }
                if (datatypeCompareMap[$scope.rightCopy.valueDomain.datatype]) {
                    $scope.rightDatatypeObj = {
                        obj: $scope.rightCopy.valueDomain[datatypeCompareMap[$scope.rightCopy.valueDomain.datatype].obj],
                        p: datatypeCompareMap[$scope.rightCopy.valueDomain.datatype].options
                    };
                }
            }
        };

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
                return a.designation.localeCompare(b.designation);
            },
            tooltip: "Sorted by name. New/Removed if any value is modified",
            title: 'Naming',
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
                return a.name.localeCompare(b.name);
            },
            tooltip: 'Sorted by name, New/Removed if any value is modified',
            title: 'Data Element Concepts',
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
                return a.name.localeCompare(b.name);
            },
            tooltip: 'Sorted by name, New/Removed if any value is modified',
            title: 'Property Concepts',
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
                return a.name.localeCompare(b.name);
            },
            tooltip: 'Sorted by name, New/Removed if any value is modified',
            title: 'ObjectClass Concepts',
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
        $scope.propertiesOptions = {
            equal: function (a, b) {
                return a.key === b.key &&
                    a.value === b.value &&
                    a.valueFormat === b.valueFormat;
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
        $scope.attachmentsOptions = {
            equal: function (a, b) {
                return a.fileid === b.fileid;
            },
            sort: function (a, b) {
                return a.filename.localeCompare(b.filename);
            },
            title: 'Attachments',
            hideSame: true,
            properties: [
                {label: 'Filename', property: 'filename'},
                {label: 'Size', property: 'filesize'},
                {label: 'Uploaded date', property: 'uploadDate'},
                {label: 'Uploaded by', property: 'uploadedBy.username'}
            ]
        };
        $scope.idsOptions = {
            equal: function (a, b) {
                return a.id === b.id &&
                    a.source === b.source &&
                    a.version === b.version;
            },
            sort: function (a, b) {
                return a.id.localeCompare(b.id);
            },
            title: 'Identifiers',
            hideSame: true,
            properties: [
                {label: 'Source', property: 'source'},
                {label: 'ID', property: 'id'},
                {label: 'Version', property: 'version'}
            ]
        };
        $scope.sourcesOptions = {
            equal: function (a, b) {
                return a.sourceName === b.sourceName &&
                    a.dateCreated === b.dateCreated &&
                    a.dateModified === b.dateModified &&
                    a.registrationStatus === b.registrationStatus &&
                    a.datatype === b.datatype;
            },
            sort: function (a, b) {
                return a.sourceName.localeCompare(b.sourceName);
            },
            title: 'Sources',
            hideSame: true,
            properties: [
                {label: 'Source Name', property: 'sourceName'},
                {label: 'Source Created Date', property: 'dateCreated'},
                {label: 'Source Modified Date', property: 'dateModified'},
                {label: 'Source Status', property: 'registrationStatus'},
                {label: 'Source Data Type', property: 'datatype'}
            ]
        };
        $scope.classificationsOptions = {
            title: 'Classifications',
            hideSame: true
        };
        $scope.valueDomainDatatypeOptions = {
            title: 'Value Type',
            hideSame: false,
            tooltip: ''
        };
        $scope.datatypeValueListOptions = {
            title: 'Value List Data Type',
            hideSame: false,
            tooltip: ''
        };
    }]);