function ExportCtrl($scope, Elastic, $window) {  
    $scope.gridCdes = [];
    $scope.gridOptions = {
        data: 'gridCdes'
        , enableColumnResize: true
        , enableRowReordering: true
        , enableCellSelection: true
    };
    
    $scope.downloadCsv = function() {
        var str = '';
        for (var i = 0; i < $scope.gridCdes.length; i++) {
            var line = '';
            for (var index in $scope.gridCdes[i]) {
                line += '"' + $scope.gridCdes[i][index] + '",';
            }
            line.slice(0, line.Length - 1);
            str += line + '\r\n';
        }
        $window.open("data:text/csv;charset=utf-8," + escape(str))
    }
    
    $scope.buildElasticQuery(function(query) {
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
               thisCde.permissbleValues = permissibleValues;
        
               $scope.gridCdes.push(thisCde);               
            }
        });
    });
}
