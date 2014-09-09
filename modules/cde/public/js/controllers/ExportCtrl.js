function ExportCtrl($scope, $window, Elastic, CsvDownload) {  
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
        return $scope.gridOptions.columnDefs.map(function(column) {return column.displayName;}).join(", ") + "\n";
    };
    
    $scope.checkIe = function() {
        var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /MSIE/i};
        if (browsers['ie'].test($window.navigator.userAgent)) {
            $scope.addAlert("danger", "For security reasons, exporting is not available in Internet Explorer. Consider using a different browser for this task.")
        }
    };
    
    $scope.exportStr = function() {
        $scope.encodedStr = "data:text/csv;charset=utf-8," + encodeURIComponent($scope.columnNames() + CsvDownload.export($scope.gridCdes));
    };

    Elastic.buildElasticQueryPre($scope);
    var settings = Elastic.buildElasticQuerySettings($scope);
    Elastic.buildElasticQuery(settings, function(query) {
        query.query.size = 1000;
        delete query.query.facets;
        delete query.query.from;
        Elastic.generalSearchQuery(query, "cde",  function(result) {
            $scope.gridCdes = [];
            var list = result.cdes;
            for (var i in list) {
                var cde = list[i];
                var thisCde = 
                {
                    primaryNameCopy: cde.naming[0].designation
                    , primaryDefinitionCopy: cde.naming[0].definition
                    , stewardOrg: cde.stewardOrg.name
                    , registrationStatus: cde.registrationState.registrationStatus
                    , naming: cde.naming.slice(1,100).map(function(naming) {return naming.designation;}).join(", ")
                    , permissibleValues: cde.valueDomain.permissibleValues.map(function(pv) {return pv.permissibleValue;}).join(", ")                                 
                    , origin: cde.origin
                    , version: cde.version       
                    , tinyId: cde.tinyId
                };              
                var ids = "";
                for (var j = 0; j < cde.ids.length; j++) {
                    ids = ids.concat(cde.ids[j].source + ":" + cde.ids[j].id + "v"  + cde.ids[j].version + "; ");   
                } 
                thisCde.ids = ids;               
                $scope.gridCdes.push(thisCde);               
            }
            $scope.exportStr();
        });
    });
    
}
