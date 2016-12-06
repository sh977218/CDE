angular.module('systemModule').controller('DiffConfigCtrl', ['$scope', function ($scope) {
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
            return angular.equals(a, b);
        },
        sort: function (a, b) {
            return a.designation.localeCompare(b.designation);
        },
        tooltip: "Sorted by name. New/Removed if any value is modified",
        title: 'Naming',
        hideSame: true,
        properties: [
            {label: 'Name', property: 'designation'},
            {label: 'Definition', property: 'definition'},
            {label: 'Context', property: 'context.contextName'}
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
            {label: 'Name', property: 'name'},
            {label: 'Origin', property: 'origin'},
            {label: 'OriginId', property: 'originId'}
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
            {label: 'Name', property: 'name'},
            {label: 'Origin', property: 'origin'},
            {label: 'OriginId', property: 'originId'}
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
            {label: 'Name', property: 'name'},
            {label: 'Origin', property: 'origin'},
            {label: 'OriginId', property: 'originId'}
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
            {label: 'Provider Org', property: 'providerOrg'},
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
