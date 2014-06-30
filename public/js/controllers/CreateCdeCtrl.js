function CreateCdeCtrl($scope, $window, $timeout, DataElement, Elastic) {
    $scope.setActiveMenu('CREATECDE');

    $scope.save = function() {
        // !TODO probably not the best way to do this
        $scope.cde.naming = [];
        $scope.cde.naming.push({
           designation: $scope.cde.designation
           , definition: $scope.cde.definition
           , context: {
               contextName: "Health"
               , acceptability: "preferred"
           }
        });
        delete $scope.cde.designation;
        delete $scope.cde.definition;
        
        DataElement.save($scope.cde, function(cde) {
            $window.location.href = "/#/deview?cdeId=" + cde._id;        
        });
    };
    
    var suggestionPromise = 0;
    $scope.showSuggestions = function () {
        if (suggestionPromise !== 0) {
            $timeout.cancel(suggestionPromise);
        }
        suggestionPromise = $timeout(function () {            
            Elastic.buildElasticQueryPre($scope);
            var settings = Elastic.buildElasticQuerySettings($scope);
            settings.searchTerm = $scope.cde.designation;
            Elastic.buildElasticQuery(settings, function(query) {
                Elastic.generalSearchQuery(query, function(result) {     
                    $scope.cdes = result.cdes;
                });
            });
        }, 1000);        
    };
}
