 function AddForkModalCtrl($scope, $modalInstance, myOrgs) {
    
    $scope.myOrgs = myOrgs;
    $scope.selection = {}; 
    
    if (myOrgs.length === 1) {
        $scope.selection.org = myOrgs[0];
    }
     
    $scope.doFork = function () {
      $modalInstance.close({org: $scope.selection.org, changeNote: $scope.selection.changeNote});
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
}
 

