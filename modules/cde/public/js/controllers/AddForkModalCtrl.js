 function AddForkModalCtrl($scope, $modalInstance, userResource) {
    $scope.selection = {}; 
    $scope.myOrgs = userResource.userOrgs;
    
    if (userResource.userOrgs.length === 1) {
        $scope.selection.org = $scope.myOrgs[0];
    }
    
    if (userResource.userOrgs.length === 1) {
        $scope.selection.org = $scope.myOrgs[0];
    }

     
    $scope.doFork = function () {
      $modalInstance.close({org: $scope.selection.org, changeNote: $scope.selection.changeNote});
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
}
 

