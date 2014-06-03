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
        var selectedLast = false;
        for (var i = 0; i < level; i++) { 
            var choice  = 0;
            selectedLast = false;
            for (var j = 0; j < elt.length; j++) {
                if (elt[j].name === $scope.newClassification.categories[i]) {
                    elt[choice]["elements"] ? elt = elt[choice]["elements"] : elt = [];
                    selectedLast = true;
                }
                choice++;
            }            
        }
        if (level>0 && !selectedLast) return [];
        else return elt;
    };  
    $scope.wipeRest = function(num) {
        $scope.newClassification.categories.splice(num,Number.MAX_SAFE_INTEGER);
    };    
}

