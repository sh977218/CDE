angular.module('cdeModule').controller('CdeHistoryCtrl', ['$scope', 'ClassificationUtil', 'AlertService',
    function ($scope, ClassificationUtil, Alert) {
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

        $scope.clickView = function(e, url, url1){
            e.stopPropagation();
            window.open(url+url1);
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
                Alert.addAlert("danger", "Select two to compare.");
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

    }]);