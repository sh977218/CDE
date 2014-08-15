 function AddSectionModalCtrl($scope, $modalInstance) {
    $scope.newSection = {cardinality: 1};
     
    $scope.okCreate = function () {
      $modalInstance.close($scope.newSection);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
}
 

