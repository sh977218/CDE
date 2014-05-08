function CreateCdeCtrl($scope, $location, $timeout, DataElement, Elastic) {
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
            $location.path('#/');        
        });
    };
    
    var suggestionPromise = 0;
    $scope.showSuggestions = function () {
        if (suggestionPromise !== 0) {
            $timeout.cancel(suggestionPromise);
        }
        suggestionPromise = $timeout(function () {
            // @TODO Reuse this bit.
            var queryStuff = {query: 
                {   
                    bool: {
                        should: {
                        function_score: {
                            boost_mode: "replace"
                            , script_score: {
                                script: "_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)"
                            }
                            , query: {
                                query_string: {
                                    fields: ["_all", "naming.designation^3"]
                                    , query: $scope.cde.designation
                                }
                            }
                        }
                        }
                        , must_not: {
                            term: {
                                "registrationState.registrationStatus": "retired"
                            }
                        }
                    }
               }};            
            Elastic.generalSearchQuery({query: queryStuff}, function(result) {
                $scope.cdes = result.cdes;
            });
        }, 1000);
    };
}
