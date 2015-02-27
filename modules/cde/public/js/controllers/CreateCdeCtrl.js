angular.module('cdeModule').controller('CreateCdeCtrl', ['$scope', '$window', '$timeout', '$modal', 'DataElement', 'Elastic', 'userResource', function($scope, $window, $timeout, $modal, DataElement, Elastic, userResource) {
    $scope.openCdeInNewTab = true;
    $scope.currentPage = 1;
    $scope.totalItems = 0;
    $scope.resultPerPage = 20;
    $scope.module = "cde";
    $scope.searchForm = {};
    $scope.classifSubEltPage = '/cde/public/html/classif-elt-createCde.html';

    $scope.elt = { classification: [], stewardOrg: {}}; 
    
    if (userResource.userOrgs.length === 1) {
        $scope.elt.stewardOrg.name = userResource.userOrgs[0];
    }
    
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
        } else if (!$scope.elt.stewardOrg.name) {
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
         if ($scope.elt) {
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
            $scope.filter = Elastic.buildElasticQueryPre($scope);
            var settings = Elastic.buildElasticQuerySettings($scope);
            settings.searchTerm = $scope.elt.designation;
            Elastic.buildElasticQuery(settings, function(query) {
                Elastic.generalSearchQuery(query, "cde", function(err, result) {
                    if (err) return;
                    $scope.cdes = result.cdes;
                    $scope.totalItems = result.totalNumber;
                });
            });
        }, 0);
    };

    $scope.openSelectDefaultClassificationModal = function () {
        var modalInstance = $modal.open({
            templateUrl: '/template/system/classifyCde',
            controller: AddClassificationModalCtrl,
            resolve: {
                module: function() {
                    return $scope.module;
                }
                , myOrgs: function() {
                    return userResource.userOrgs;
                }
                , cde: function() {
                    return $scope.elt;
                }
                , orgName: function() {
                    return undefined;
                } 
                , pathArray: function() {
                    return undefined;
                }
                , addAlert: function() {
                    return $scope.addAlert;
                }
                , addClassification: function() {
                    return {
                        addClassification: function(newClassification) {
                            exports.classifyItem($scope.elt, newClassification.orgName, newClassification.categories);
                            var deepCopy = {
                                orgName: newClassification.orgName
                                , categories: []
                            };                            
                        }
                    };
                }                
            }            
        });
        
        modalInstance.result.then(function () {
        });
    };
    
    $scope.showRemoveClassificationModal = function(orgName, pathArray) {
        var modalInstance = $modal.open({
            templateUrl: '/template/system/removeClassificationModal',
            controller: RemoveClassificationModalCtrl,
            resolve: {
                classifName: function() {
                    return pathArray[pathArray.length-1];
                }
                , pathArray: function() {return pathArray;}
            }
        });

        modalInstance.result.then(function () {
            $scope.removeClassification(orgName, pathArray);
        });
    };
    
}
]);