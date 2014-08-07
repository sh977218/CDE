function ExportCtrl($scope, Elastic, CsvDownload) {  
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
            , {field: 'ids', displayName: 'IDs', width: 100}
        ]       
    };
    
    $scope.downloadCsv = function() {
        CsvDownload.export($scope.gridCdes);
    };
    Elastic.buildElasticQueryPre($scope);
    var settings = Elastic.buildElasticQuerySettings($scope);
    Elastic.buildElasticQuery(settings, function(query) {
        query.query.size = 1000;
        delete query.query.facets;
        delete query.query.from;
        Elastic.generalSearchQuery(query, function(result) {
            $scope.gridCdes = [];
            var list = result.cdes;
            for (var i in list) {
                var cde = list[i];
                var thisCde = 
                {
                    uuid: cde.uuid
                    , version: cde.version
                    , primaryNameCopy: cde.naming[0].designation
                    , primaryDefinitionCopy: cde.naming[0].definition
                    , stewardOrg: cde.stewardOrg.name
                    , origin: cde.origin
                    , registrationStatus: cde.registrationState.registrationStatus
                    , naming: cde.naming.slice(1,100).map(function(naming) {return naming.designation;}).join(", ")
                    , permissibleValues: cde.valueDomain.permissibleValues.map(function(pv) {return pv.permissibleValue;}).join(", ")
                };              
                var ids = "";
                for (var j = 0; j < cde.ids.length; j++) {
                    ids = ids.concat(cde.ids[j].source + ":" + cde.ids[j].id + "v"  + cde.ids[j].version + "; ");   
                } 
                thisCde.ids = ids;               
                $scope.gridCdes.push(thisCde);               
            }
        });
    });
}
