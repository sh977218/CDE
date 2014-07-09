function ClassificationManagementCtrl($scope, $http, $modal, $route, OrgClassification) {
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
        OrgClassification.remove({
            orgName: orgName
            , categories: elts
        }, function (res) {
            $route.reload();
            $scope.addAlert("success", "Classification Deleted");
        });
    };    
    
    $scope.openAddClassificationModal = function () {
        var modalInstance = $modal.open({
            templateUrl: 'addClassificationModalContent.html',
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
            OrgClassification.save(newClassification, function(response) {
                if (response.error) {
                    $scope.addAlert("danger", response.error.message);        
                }
                else {
                    $route.reload();
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
            console.log("oldName"+pathArray[pathArray.length-1]);
            if (newname) console.log("newName"+newname);
            /*newClassification.orgName = $scope.orgToManage;
            OrgClassification.save(newClassification, function(response) {
                if (response.error) {
                    $scope.addAlert("danger", response.error.message);        
                }
                else {
                    $route.reload();
                    $scope.addAlert("success", "Classification Added");                      
                }              
            });*/
        });        
    };
}

function RenameClassificationModalCtrl($scope, $modalInstance, classifName) {
    $scope.classifName = classifName;
    $scope.close = function(newname) {
        $modalInstance.close(newname);
    };  
}
