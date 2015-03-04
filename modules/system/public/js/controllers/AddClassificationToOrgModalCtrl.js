angular.module('systemModule').controller('AddClassificationToOrgModalCtrl', ['$scope', '$modalInstance', 'ClassificationPathBuilder', 'org', 'pathArray', function($scope, $modalInstance, ClassificationPathBuilder, org, pathArray) {
    $scope.path = ClassificationPathBuilder.constructPath(org, pathArray);
    
    $scope.newClassification = {orgName: org, categories: (pathArray ? pathArray : [])};
    $scope.newClassificationValue = '';
    
    $scope.parentScope = {newClassifName: ""};
     
    $scope.close = function () {
        $modalInstance.close();
    };
    
    $scope.addClassification = function () {
        $scope.newClassification.categories.push($scope.parentScope.newClassifName);
        $modalInstance.close($scope.newClassification);
    };
    
}]);