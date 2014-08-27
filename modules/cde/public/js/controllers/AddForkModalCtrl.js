 function AddForkModalCtrl($scope, $modalInstance, myOrgs) {
    
     $scope.myOrgs = myOrgs;
    $scope.selection = {}; 
     
    $scope.doFork = function () {
      $modalInstance.close({org: $scope.selection.org, changeNote: $scope.selection.changeNote});
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
}
 

