function AddClassificationToOrgModalCtrl($scope, $modalInstance, ClassificationTree, org) {
    $scope.classificationType = "org";
    $scope.org = org;
    $scope.newClassification = { categories: [] };
    $scope.parentScope = {newClassifName: ""};
    $scope.classTree = ClassificationTree;
     
    $scope.close = function () {
        $modalInstance.close();
    };
    
    $scope.addClassification = function () {
        $scope.newClassification.categories.push($scope.parentScope.newClassifName);
        $modalInstance.close($scope.newClassification);
    };    
  
}


