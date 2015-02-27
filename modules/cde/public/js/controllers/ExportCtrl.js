systemModule.controller('ExportCtrl', ['$scope', '$window', 'CsvDownload', function($scope, $window, CsvDownload) {
    $scope.gridCdes = [];

    $scope.gridOptions = {
        data: 'gridCdes'
        , enableColumnResize: true
        , enableRowReordering: true
        , enableCellSelection: true
        , columnDefs: [
            {field: 'primaryNameCopy', displayName: 'Name'}
            , {field: 'primaryDefinitionCopy', displayName: 'Definition'}
            , {field: 'stewardOrg', displayName: 'Steward', width: 60}
            , {field: 'registrationStatus', displayName: 'Status', width: 80}
            , {field: 'naming', displayName: 'Other Names', width: 200}
            , {field: 'permissibleValues', displayName: 'Permissible Values', width: 200}
            , {field: 'origin', displayName: 'Origin', width: 60}
            , {field: 'version', displayName: 'Version', width: 40}
            , {field: 'tinyId', displayName: 'NLM ID', width: 100}
            , {field: 'ids', displayName: 'IDs', width: 100}
        ]
    };


    $scope.columnNames = function() {
        return $scope.gridOptions.columnDefs.map(function(column) { return column.displayName; }).join(", ") + "\n";
    };

    $scope.checkIe = function() {
        var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /MSIE/i};
        if (browsers['ie'].test($window.navigator.userAgent)) {
            $scope.addAlert("danger", "For security reasons, exporting is not available in Internet Explorer. Consider using a different browser for this task.");
        }
    };

    $scope.exportStr = function(gridCdes) {
        $scope.encodedStr = "data:text/csv;charset=utf-8," + encodeURIComponent($scope.columnNames() + CsvDownload.export(gridCdes));
    };

}
]);