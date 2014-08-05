function ExportCtrl($scope, Elastic, CsvDownload) {  
    $scope.gridCdes = [];
    $scope.gridOptions = {
        data: 'gridCdes'
        , enableColumnResize: true
        , enableRowReordering: true
        , enableCellSelection: true
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
                    ID: cde.uuid
                    , Version: cde.version
                    , Name: cde.naming[0].designation
                    , Definition: cde.naming[0].definition
                    , Steward: cde.stewardOrg.name
                    , "OriginId": cde.originId 
                    , Origin: cde.origin
                    , "RegistrationStatus": cde.registrationState.registrationStatus
               }
               var otherNames = "";
               for (var j = 1; j < cde.naming.length; j++) {
                   otherNames = otherNames.concat(" " + cde.naming[j].designation);
               } 
               thisCde.otherNames = otherNames;
               
               var permissibleValues = "";
               for (var j = 0; j < cde.valueDomain.permissibleValues.length; j++) {
                   permissibleValues = permissibleValues.concat(cde.valueDomain.permissibleValues[j].permissibleValue + "; ");
               } 
               thisCde.permissibleValues = permissibleValues;
        
               $scope.gridCdes.push(thisCde);               
            }
        });
    });
}
