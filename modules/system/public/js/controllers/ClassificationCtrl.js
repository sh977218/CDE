function ClassificationCtrl($scope, $modal, $routeParams, CdeClassification) {
    $scope.initCache(); 
    
    $scope.openAddClassificationModal = function () {
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
                , addClassification: function() {
                    return {
                        addClassification: function(newClassification) {
                            CdeClassification.save(newClassification, function(res) {
                                $scope.addAlert("success", res.msg);                                
                            });                   
                        }
                    };
                }
            }          
        });

        modalInstance.result.then(function () {
            $scope.reload($routeParams);
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
        return stewardClassifications.workingGroup && !($scope.myOrgs.indexOf(stewardClassifications.stewardOrg.name)>=0);
    };
    
    $scope.showRemoveClassificationModal = function(orgName, pathArray) {
        var modalInstance = $modal.open({
            templateUrl: '/template/system/removeClassificationModal',
            controller: RemoveClassificationModalCtrl,
            resolve: {
                classifName: function() {
                    return pathArray[pathArray.length-1];
                }
            }
        });

        modalInstance.result.then(function () {
            $scope.removeClassification(orgName, pathArray);
        });
    };
}
 
function RemoveClassificationModalCtrl($scope, $modalInstance, classifName) {
    $scope.classifName = classifName;

    $scope.ok = function() {
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };  
}
