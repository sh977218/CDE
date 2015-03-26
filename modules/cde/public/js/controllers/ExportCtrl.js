angular.module('cdeModule').controller('ExportCtrl', ['$scope', '$window', 'CsvDownload', function($scope, $window, CsvDownload) {
    $scope.gridCdes = [];

    $scope.cdeToExportCde = function(cde) {
        var newCde = 
        {
            primaryNameCopy: cde.naming[0].designation
            , primaryDefinitionCopy: cde.naming[0].definition
            , stewardOrg: cde.stewardOrg.name
            , registrationStatus: cde.registrationState.registrationStatus
            , naming: cde.naming.slice(1, 100).map(function(naming) {
                return naming.designation;
            }).join(", ")
            , permissibleValues: cde.valueDomain.permissibleValues.map(function(pv) {
                return pv.permissibleValue;
            }).join(", ")
            , origin: cde.origin
            , version: cde.version
            , tinyId: cde.tinyId
        };
        return newCde;
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

}]);