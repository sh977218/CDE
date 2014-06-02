function AddClassificationToOrgModalCtrl($scope, $modalInstance, $http, org) {
    $scope.classificationType = "orgClass";
    $scope.org = org;
    $scope.newClassification = { categories: [] };
     
    $scope.okCreate = function (classification) {
      $modalInstance.close(classification);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
    
    $scope.getCategories = function(level, choice) {
        var elt = org.classifications;
        for (var i = 0; i < level; i++) { elt = elt[choice]["elements"]; }
        return elt;
    };
}

