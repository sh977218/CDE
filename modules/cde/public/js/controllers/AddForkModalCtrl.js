 function AddForkModalCtrl($scope, $modalInstance, userResource) {
    $scope.selection = {}; 
    
    if (userResource.userOrgs.length === 1) {
        $scope.selection.org = userResource.userOrgs[0];
    }
    
    if (userResource.userOrgs.length === 1) {
        $scope.selection.org = userResource.userOrgs[0];
    }

     
    $scope.doFork = function () {
      $modalInstance.close({org: $scope.selection.org, changeNote: $scope.selection.changeNote});
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
}
 

