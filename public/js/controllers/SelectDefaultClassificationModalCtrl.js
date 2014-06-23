function SelectDefaultClassificationModalCtrl($scope, $modalInstance, ClassificationTree, org) {
    $scope.org = org;
    $scope.defaultClassification = { categories: [] };
    $scope.classTree = ClassificationTree;
     
    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.selectClassification = function (cat) {
        $scope.defaultClassification.categories.push(cat.name);
        console.log("selecting: " + JSON.stringify($scope.defaultClassification));
        $modalInstance.close($scope.defaultClassification.categories);
    };   

}