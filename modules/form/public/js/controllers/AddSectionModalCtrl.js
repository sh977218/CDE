 function AddSectionModalCtrl($scope, $modalInstance, cardinalityOptions) {
    $scope.newSection = {cardinality: "1"};
    $scope.cardinalityOptions = cardinalityOptions;
     
    $scope.okCreate = function () {
      $modalInstance.close($scope.newSection);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
}
 

