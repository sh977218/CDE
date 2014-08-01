 function AddUsedByModalCtrl($scope, $modalInstance, $http) {
    $scope.orgAutocomplete = function (viewValue) {
        return $http.get("/autocomplete/org/" + viewValue).then(function(response) { 
            return response.data;
        }); 
     };     

    $scope.okCreate = function (classification) {
      $modalInstance.close(classification);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
}
 