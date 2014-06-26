function SelectDefaultClassificationModalCtrl($scope, $modalInstance, ClassificationTree, $http, orgName, defaultClassifications) {    
    $http.get("/org/" + orgName).then(function(result) {
       $scope.org = result.data; 
    });
    
//    $scope.lastUsedClassifications = $scope.cache.get("lastUsedClassification");
//    if (!$scope.defaultClassification) {
//    }
    
    
    
    $scope.defaultClassification = { categories: [] };
    $scope.classTree = ClassificationTree;
     
    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.selectClassification = function (cat) {
        $scope.defaultClassification.categories.push(cat.name);
        defaultClassifications.push($scope.defaultClassification.categories.slice(0));
    };   

}