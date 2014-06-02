function AddClassificationToOrgModalCtrl($scope, $modalInstance, $http, org) {
    $scope.classificationType = "orgClass";
    $scope.org = org;
    $scope.newClassification = { categories: [] };
    $scope.indices = [];
     
    $scope.okCreate = function (classification) {
      $modalInstance.close(classification);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
    
    $scope.getCategories = function(level) {
        var elt = org.classifications;
        for (var i = 0; i < level; i++) { 
            var choice  = 0;
            for (var j = 0; j < elt.length; j++) {
                if (elt[j].name == $scope.newClassification.categories[i]) break;
                choice++;
            }
            elt = elt[choice]["elements"]; 
        }
        return elt;
    };
}

