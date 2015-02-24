function ClassificationCtrl($scope, $modal, $routeParams, CdeClassification, OrgHelpers, userResource) {
    $scope.initCache(); 
    
    $scope.openAddClassificationModal = function () {
        var modalInstance = $modal.open({
          templateUrl: '/template/system/classifyCde',
          controller: AddClassificationModalCtrl,
          resolve: {
                module: function() {
                    return $scope.module;
                }
                , myOrgs: function() {
                    return $scope.myOrgs;
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
        return !(OrgHelpers.showWorkingGroup(stewardClassifications.stewardOrg.name, userResource.user) || $scope.user.siteAdmin);
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