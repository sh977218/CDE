function CreateCdeCtrl($scope, $window, $timeout, $modal, DataElement, Elastic) {
    $scope.setActiveMenu('CREATECDE');
    
    $scope.cde = { classification: []}; 
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
        DataElement.save($scope.cde, function(cde) {
            $window.location.href = "/#/deview?cdeId=" + cde._id;        
        });
    };
    
    $scope.classificationToFilter = function() {
         if ($scope.cde != null) {
             return $scope.cde.classification;
         } 
    };    
    
    $scope.removeClassification = function(orgName, elts) {
        var steward = exports.findSteward($scope.cde, orgName);
        exports.deleteCategory(steward.object, elts);
        if (steward.object.elements.length === 0) {
            for (var i=0; i<$scope.cde.classification.length; i++) {
                if ($scope.cde.classification[i].stewardOrg.name === orgName) $scope.cde.classification.splice(i,1);
            }
        }
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
            templateUrl: 'addClassificationModalContent.html',
            controller: AddClassificationModalCtrl,
            resolve: {
                myOrgs: function() {
                    return $scope.myOrgs;
                }
                , cde: function() {
                    return $scope.cde;
                }
                , addAlert: function() {
                    return $scope.addAlert;
                }
                , addClassification: function() {
                    return {
                        addClassification: function(newClassification) {
                            var steward = exports.findSteward($scope.cde, newClassification.orgName);
                            if (!steward) {
                                $scope.cde.classification.push({
                                    stewardOrg: {
                                        name: newClassification.orgName
                                    }
                                    , elements: []
                                });
                                steward = exports.findSteward($scope.cde, newClassification.orgName);
                            }  
                            for (var i=1; i<=newClassification.categories.length; i++){
                                exports.addCategory(steward.object, newClassification.categories.slice(0,i));
                            }
                            var deepCopy = {
                                orgName: newClassification.orgName
                                , categories: []
                            };
                            newClassification.categories.pop();    
                        }
                    };
                }                
            }            
        });
        
        modalInstance.result.then(function () {
        });
    };
    
}
