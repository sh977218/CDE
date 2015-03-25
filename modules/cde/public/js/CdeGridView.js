angular.module('cdeModule')
.factory('CdeGridView', function() {
    this.gridOptions = {
        data: 'gridCdes'
        , enableColumnResize: true
        , enableRowReordering: true
        , enableCellSelection: true
        , columnDefs: [
            {field: 'primaryNameCopy', displayName: 'Name'}
            , {field: 'naming', displayName: 'Other Names', width: 200}
            , {field: 'stewardOrg', displayName: 'Steward', width: 60}
            , {field: 'registrationStatus', displayName: 'Status', width: 80}
            , {field: 'permissibleValues', displayName: 'Permissible Values', width: 200}
            , {field: 'origin', displayName: 'Origin', width: 60}
            , {field: 'ids', displayName: 'IDs', width: 100}
        ]
    };
    this.cdeToExportCde = function(cde) {
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

        var ids = "";
        for (var j = 0; j < cde.ids.length; j++) {
            ids = ids.concat(cde.ids[j].source + ":" + cde.ids[j].id + "v" + cde.ids[j].version + "; ");
        }
        newCde.ids = ids;
        return newCde;
    };
    return this;
});