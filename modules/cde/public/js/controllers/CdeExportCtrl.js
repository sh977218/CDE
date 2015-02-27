systemModule.controller('CdeExportCtrl', ['$scope', 'Elastic', function($scope, Elastic) {
    $scope.filter = Elastic.buildElasticQueryPre($scope);
    var settings = Elastic.buildElasticQuerySettings($scope);
    Elastic.buildElasticQuery(settings, function(query) {
        query.query.size = 1000;
        delete query.query.aggregations;
        delete query.query.from;
        Elastic.generalSearchQuery(query, "cde", function(err, result) {
            if (err) {
                return $scope.addAlert("There was a problem with your query");
            }
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
                thisCde.ids = ids;
                $scope.gridCdes.push(thisCde);
            }
            $scope.exportStr($scope.gridCdes);
        });
    });

}
]);