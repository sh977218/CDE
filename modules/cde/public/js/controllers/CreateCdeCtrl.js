function CreateCdeCtrl($scope, $window, $timeout, $modal, DataElement, Elastic) {
    $scope.openCdeInNewTab = true;
    $scope.currentPage = 1;
    $scope.totalItems = 0;
    $scope.resultPerPage = 20;
    $scope.searchForm = {};
    $scope.$watch('currentPage', function() {
        $scope.showSuggestions();
    }); 
        
    $scope.elt = { classification: []}; 
    $scope.save = function() {
        $scope.elt.naming = [];
        $scope.elt.naming.push({
           designation: $scope.elt.designation
           , definition: $scope.elt.definition
           , context: {
               contextName: "Health"
               , acceptability: "preferred"
           }
        });
        delete $scope.elt.designation;
        delete $scope.elt.definition;     
        DataElement.save($scope.elt, function(cde) {
            $window.location.href = "/#/deview?cdeId=" + cde._id;        
        });
    };
    
    $scope.validationErrors = function() {
        if (!$scope.elt.designation) {
            return "Please enter a name for the new CDE";
        } else if (!$scope.elt.definition) {
            return "Please enter a definition for the new CDE";
        } else if (!$scope.elt.stewardOrg) {
            return "Please select a steward for the new CDE";
        }
        if ($scope.elt.classification.length === 0) {
            return "Please select at least one classification";
        } else {
            var found = false;
            for (var i = 0; i < $scope.elt.classification.length; i++) {
                if ($scope.elt.classification[i].stewardOrg.name === $scope.elt.stewardOrg.name) {
                    found = true;
                }
            }
            if (!found) {
                return "Please select at least one classification owned by " + $scope.elt.stewardOrg.name;            
            }
        } 
        return null;
    };
    
    $scope.classificationToFilter = function() {
         if ($scope.elt != null) {
             return $scope.elt.classification;
         } 
    };    
    
    $scope.removeClassification = function(orgName, elts) {
        var steward = exports.findSteward($scope.elt, orgName);
        exports.modifyCategory(steward.object, elts, {type: exports.actions.delete});
        if (steward.object.elements.length === 0) {
            for (var i=0; i<$scope.elt.classification.length; i++) {
                if ($scope.elt.classification[i].stewardOrg.name === orgName) $scope.elt.classification.splice(i,1);
            }
        }
    };     
    
    var suggestionPromise = 0;
    $scope.showSuggestions = function () {
        if (suggestionPromise !== 0) {
            $timeout.cancel(suggestionPromise);
        }
        if (!$scope.elt.designation || $scope.elt.designation.length < 3) {
            return;
        }
        suggestionPromise = $timeout(function () {            
            Elastic.buildElasticQueryPre($scope);
            var settings = Elastic.buildElasticQuerySettings($scope);
            settings.searchTerm = $scope.elt.designation;
            Elastic.buildElasticQuery(settings, function(query) {
                Elastic.generalSearchQuery(query, "cde", function(result) {     
                    $scope.cdes = result.cdes;
                    $scope.totalItems = result.totalNumber;
                });
            });
        }, 1000);
    };

    $scope.openSelectDefaultClassificationModal = function () {
        var modalInstance = $modal.open({
            templateUrl: '/template/system/addClassification',
            controller: AddClassificationModalCtrl,
            resolve: {
                myOrgs: function() {
                    return $scope.myOrgs;
                }
                , cde: function() {
                    return $scope.elt;
                }
                , addAlert: function() {
                    return $scope.addAlert;
                }
                , addClassification: function() {
                    return {
                        addClassification: function(newClassification) {
                            var steward = exports.findSteward($scope.elt, newClassification.orgName);
                            if (!steward) {
                                $scope.elt.classification.push({
                                    stewardOrg: {
                                        name: newClassification.orgName
                                    }
                                    , elements: []
                                });
                                steward = exports.findSteward($scope.elt, newClassification.orgName);
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
