angular.module('cdeModule')
.factory('CdeGridView', function() {
    this.gridOptions = {
        data: 'gridCdes'
        , enableColumnResize: true
        , enableRowReordering: true
        , enableCellSelection: true
        , enableSorting: false
        , columnDefs: [
            {field: 'primaryNameCopy', displayName: 'Name'}
            , {field: 'naming', displayName: 'Other Names', width: 200}
            , {field: 'permissibleValues', displayName: 'Permissible Values', width: 200}
            , {field: 'stewardOrg', displayName: 'Steward', width: 60}
            , {field: 'usedBy', displayName: 'Used By', width: 150}
            , {field: 'registrationStatus', displayName: 'Status', width: 80}
            , {field: 'administrativeStatus', displayName: 'Admin Status', width: 170}
            , {field: 'ids', displayName: 'IDs', width: 170}
        ]
    };
    this.cdeToExportCde = function(cde) {
        var newCde =
        {
            primaryNameCopy: cde.naming[0].designation
            , primaryDefinitionCopy: cde.naming[0].definition
            , stewardOrg: cde.stewardOrg.name
            , registrationStatus: cde.registrationState.registrationStatus
            , naming: cde.naming.slice(1, 3).map(function(naming) {
                return naming.designation;
            }).join("<br> ")
            , permissibleValues: cde.valueDomain.permissibleValues.map(function(pv) {
                return pv.permissibleValue;
            }).join(", ")
            , origin: cde.origin
            , version: cde.version
            , tinyId: cde.tinyId
            , usedBy: cde.usedBy.join(", ")
            , administrativeStatus: cde.registrationState.administrativeStatus
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