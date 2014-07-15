function CreateCdeCtrl($scope, $window, $timeout, $modal, DataElement, Elastic) {
    $scope.currentPage = 1;
    $scope.totalItems = 0;
    $scope.resultPerPage = 20;
    $scope.$watch('currentPage', function() {
        $scope.showSuggestions();
    }); 
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
    
    $scope.validationErrors = function() {
        if ($scope.cde.classification.length === 0) {
            return "Please select at least one classification";
        } else if ($scope.cde.classification.length === 1) {
            return "Please select at least one classification owned by " + $scope.cde.stewardOrg.name;
        } else {
            return null;
        }
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
            Elastic.buildElasticQueryPre($scope);
            var settings = Elastic.buildElasticQuerySettings($scope);
            settings.searchTerm = $scope.cde.designation;
            Elastic.buildElasticQuery(settings, function(query) {
                Elastic.generalSearchQuery(query, function(result) {     
                    $scope.cdes = result.cdes;
                    $scope.totalItems = result.totalNumber;
                });
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
