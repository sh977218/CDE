angular.module('systemModule').controller('ClassificationCtrl',
    ['$scope', '$uibModal', '$routeParams', 'CdeClassification', 'OrgHelpers', 'userResource',
        function($scope, $modal, $routeParams, CdeClassification, OrgHelpers, userResource)
{
    $scope.initCache();

    $scope.openAddClassificationModal = function () {
        $modal.open({
            animation: false,
          templateUrl: '/system/public/html/classifyElt.html',
          controller: 'AddClassificationModalCtrl',
          resolve: {
                module: function() {
                    return $scope.module;
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
                , addClassification: function() {
                    return {
                        addClassification: function(newClassification) {
                            CdeClassification.save(newClassification, function(res) {
                                $scope.reload($routeParams);
                                $scope.addAlert("success", res.msg);
                            });                   
                        }
                    };
                }
            }          
        });
    };
     
    $scope.removeClassification = function(orgName, elts) {
        CdeClassification.remove({
            cdeId: $scope.elt._id
            , orgName: orgName
            , categories: elts
        }, function (res) {
            $scope.reload($routeParams);
            $scope.addAlert("success", "Classification Deleted");
        });
    };     

    $scope.hideWorkingGroups = function(stewardClassifications) {
        return !(OrgHelpers.showWorkingGroup(stewardClassifications.stewardOrg.name, userResource.user) || $scope.user.siteAdmin);
    };
    
    $scope.showRemoveClassificationModal = function(orgName, pathArray) {
        var modalInstance = $modal.open({
            templateUrl: '/system/public/html/removeClassificationModal.html',
            controller: 'RemoveClassificationModalCtrl',
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
 }]);

angular.module("systemModule").controller('ClassLeafCtrl', ['$scope', function($scope){
    var j = JSON.parse(JSON.stringify($scope.pathArray));
    j.push($scope.elt.name);
    $scope.pathArray = j;
}]);