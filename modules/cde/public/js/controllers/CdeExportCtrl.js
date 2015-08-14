//angular.module('cdeModule').controller('CdeExportCtrl', ['$scope', 'Elastic', function($scope, Elastic) {
//    var settings = Elastic.buildElasticQuerySettings($scope);
//    Elastic.buildElasticQuery(settings, function(query) {
//        query.query.size = 1000;
//        delete query.query.aggregations;
//        delete query.query.from;
//        Elastic.generalSearchQuery(query, "cde", function(err, result) {
//            if (err) {
//                return $scope.addAlert("There was a problem with your query");
//            }
//            $scope.gridCdes = [];
//            var list = result.cdes;
//            for (var i in list) {
//                var cde = list[i];
//                var thisCde = CdeGridView.cdeToExportCde(cde);
//                var ids = "";
//                for (var j = 0; j < cde.ids.length; j++) {
//                    ids = ids.concat(cde.ids[j].source + ":" + cde.ids[j].id + "v" + cde.ids[j].version + "; ");
//                }
//                thisCde.ids = ids;
//                $scope.gridCdes.push(thisCde);
//            }
//            $scope.exportStr($scope.gridCdes);
//        });
//    });
//
//}
//]);