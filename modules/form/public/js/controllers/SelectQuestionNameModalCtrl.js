 function SelectQuestionNameModalCtrl($scope, $modalInstance, $http, cde) {
     
    $http.get("debytinyid/" + cde.tinyId + "/" + cde.version).then(function (result) {
        $scope.cde = result.data;
    });
     
    $scope.okSelect = function (naming) {
      $modalInstance.close(naming.designation);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
}
 
