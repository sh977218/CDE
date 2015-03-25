angular.module('cdeModule').controller('CdeGridListCtrl', ['$scope', function($scope) {

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
    $scope.gridCdes = [];
    $scope.transformCdes = function() {
        $scope.gridCdes = [];
        var list = $scope.cdes;
        for (var i in list) {
            var cde = list[i];
            var thisCde = $scope.cdeToExportCde(cde);
            var ids = "";
            for (var j = 0; j < cde.ids.length; j++) {
                ids = ids.concat(cde.ids[j].source + ":" + cde.ids[j].id + "v" + cde.ids[j].version + "; ");
            }
            thisCde.ids = ids;
            $scope.gridCdes.push(thisCde);
        }
    };

    $scope.$on('elementsLoaded', function() {
        $scope.transformCdes();
    });

}]);
