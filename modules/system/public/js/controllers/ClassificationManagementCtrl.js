function ClassificationManagementCtrl($scope, $http, $modal, $route, OrgClassification) {
    $scope.module = "cde";
    
    if ($scope.myOrgs.length > 0) {
        $scope.orgToManage = $scope.myOrgs[0];
    }
    
    $scope.org = {};
    
    $scope.updateOrg = function() {
        if ($scope.orgToManage !== undefined) {
            $http.get("/org/" + $scope.orgToManage).then(function(response) {
               $scope.org = response.data;
            });
        }
    };
    
    $scope.updateOrg();
    
    $scope.classificationToFilter = function() {
         return $scope.org.classifications;
    };
    
    $scope.removeClassification = function(orgName, elts) {
        OrgClassification.resource.remove({
            orgName: orgName
            , categories: elts
        }, function (org) {
            $scope.org = org;
            $scope.addAlert("success", "Classification Deleted");
        });
    };    
    
    $scope.openAddClassificationModal = function () {
        var modalInstance = $modal.open({
            templateUrl: '/template/system/addClassification',
            controller: AddClassificationToOrgModalCtrl,
            resolve: {
                org: function() {
                    return $scope.org;
                }   
                , mode: function() {
                    return "org";
                }                 
            }
        });

        modalInstance.result.then(function (newClassification) {
            newClassification.orgName = $scope.orgToManage;
            OrgClassification.resource.save(newClassification, function(response) {
                if (response.error) {
                    $scope.addAlert("danger", response.error.message);        
                }
                else {
                    $scope.org = response;
                    $scope.addAlert("success", "Classification Added");                      
                }              
            });
        });
    };
    
    $scope.showRenameDialog = function(orgName, pathArray) {
        var modalInstance = $modal.open({
            templateUrl: 'renameClassificationModal.html',
            controller: RenameClassificationModalCtrl,
            resolve: {
                classifName: function() {
                    return pathArray[pathArray.length-1];
                }           
            }
        });

        modalInstance.result.then(function (newname) {           
            OrgClassification.rename(orgName, pathArray, newname, function(response) {
                $scope.org = response;
            });
        });        
    };
}

function RenameClassificationModalCtrl($scope, $modalInstance, classifName) {
    $scope.classifName = classifName;
    $scope.close = function(newname) {
        $modalInstance.close(newname);
    };  
}