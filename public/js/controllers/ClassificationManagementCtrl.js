function ClassificationManagementCtrl($scope, $http, $modal, Classification) {
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
    }
    
    $scope.updateOrg();
    
    var indexedConceptSystemClassifications = [];
    $scope.classificationToFilter = function() {
         indexedConceptSystemClassifications = [];
         return $scope.org.classifications;
    };
    
    $scope.removeClassification = function(orgName, conceptSystem, concept) {
        var classToDel = {stewardOrg:{name:orgName}, conceptSystem:conceptSystem, concept:concept};
        $http.post("/removeClassificationFromOrg", classToDel).then(function(response) {
            $scope.addAlert("success", response.data);
            $scope.updateOrg();
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
                return $scope.orgToManage;
            }          
          }
        });

        modalInstance.result.then(function (newClassification) {
            newClassification.stewardOrg = {name: $scope.orgToManage};
            Classification.addToOrg(newClassification, function (res) {
                $scope.addAlert("success", "Classification Added");
                $scope.updateOrg();
            });
        });
    };
}
