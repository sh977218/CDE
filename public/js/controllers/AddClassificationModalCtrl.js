 function AddClassificationModalCtrl($scope, $modalInstance, $http, myOrgs) {
    $scope.myOrgs = myOrgs;  
    $scope.orgClassSystems = [];
    $scope.getOrgClassSystems = function () {
        $http.get("/autocomplete/classification/all").then(function(response) { 
            $scope.orgClassSystems = response.data;
        });
    };
    $scope.getOrgClassSystems();     
     
    $scope.okCreate = function (classification) {
      $modalInstance.close(classification);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
}
