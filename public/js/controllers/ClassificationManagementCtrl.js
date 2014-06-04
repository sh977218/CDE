function ClassificationManagementCtrl($scope, $http, $modal, $route, Classification, OrgClassification) {
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
         indexedConceptSystemClassifications = [];
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
    
    $scope.isInConceptSystem = function(system) {
        return function(classi) {
            return classi.conceptSystem === system;
        };
    };

    
    $scope.openAddClassificationModal = function () {
        var modalInstance = $modal.open({
          templateUrl: 'addClassificationModalContent.html',
          controller: AddClassificationToOrgModalCtrl,
          resolve: {
            org: function() {
                return $scope.org;
            }           
          }
        });

        modalInstance.result.then(function (newClassification) {
            newClassification.orgName = $scope.orgToManage;
            console.log(newClassification);
            OrgClassification.save(newClassification, function() {
                $route.reload();
                $scope.addAlert("success", "Classification Added");                
            });
            /*Classification.addToOrg(newClassification, function (res) {
                $scope.addAlert("success", "Classification Added");
                $scope.updateOrg();
            });*/
        });
    };
}
