 function SelectQuestionNameModalCtrl($scope, $modalInstance, cardinalityOptions) {
    $scope.newQuestion = {cardinality: "1", question: {}};
    $scope.cardinalityOptions = cardinalityOptions;
     
    $scope.okCreate = function () {
      $modalInstance.close($scope.newQuestion);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
}
 

