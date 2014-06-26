function CreateCdeCtrl($scope, $window, $timeout, $modal, DataElement, Elastic) {
    $scope.setActiveMenu('CREATECDE');
    
    $scope.defaultClassifications = [];
    
    $scope.removeDefaultClassification = function(index) {
        $scope.defaultClassifications.splice(index, 1);
    };
    
    $scope.save = function() {
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

        var newClassifTree = function(defaultClassification) {
            var result = {};
            var current = result;
            for (var i=0; i < defaultClassification.length; i++) {
                current.elements = [{name: defaultClassification[i]}];
                current = current.elements[0];
            }
            return result;
        };
        
        $scope.cde.classification = [{stewardOrg: {name: $scope.cde.stewardOrg.name}, elements: []}];
        for (var j = 0; j < $scope.defaultClassifications.length; j++) {
            $scope.cde.classification[0].elements.push(newClassifTree($scope.defaultClassifications[j]));
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
                , defaultClassifications: function() {
                    return $scope.defaultClassifications;
                }
                , addAlert: function() {
                    return $scope.addAlert;
                }
            }
        });
        
        modalInstance.result.then(function () {
        });
    };
    
}
