 function SelectQuestionNameModalCtrl($scope, $modalInstance, cde) {
     
    $http.get("debyuuid/" + cde.uuid + "/" + cde.version).then(function (result) {
        $scope.cde = result.data;
    });
     
    $scope.okCreate = function (naming) {
      $modalInstance.close(naming.designation);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
}
 

