function CreateCdeCtrl($scope, $window, $timeout, $modal, DataElement, Elastic) {
    $scope.setActiveMenu('CREATECDE');
    
    $scope.defaultClassification = $scope.cache.get("defaultClassification");
    if (!$scope.defaultClassification) {
        $scope.defaultClassification = [];
    }
    
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
        
        $scope.cde.classification = [{stewardOrg: {name: $scope.cde.stewardOrg.name}}];
        var current = $scope.cde.classification[0];
        for (var i in $scope.defaultClassification) {
            current.elements = [{name: $scope.defaultClassification[i]}];
            current = current.elements[0];
        }
                
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

    $scope.openSelectDefaultClassificationModal = function () {
        var modalInstance = $modal.open({
            templateUrl: 'selectDefaultClassificationModalContent.html',
            controller: SelectDefaultClassificationModalCtrl,
            resolve: {
                orgName: function() {
                    return $scope.cde.stewardOrg.name;
                }                   
            }
        });

        modalInstance.result.then(function (defaultClassification) {
            $scope.defaultClassification = defaultClassification;
            $scope.cache.put("defaultClassification", $scope.defaultClassification);
        });
    };
    
}
