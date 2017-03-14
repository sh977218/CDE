angular.module('systemModule').controller('AddClassificationToOrgModalCtrl',
    ['$scope', '$uibModalInstance', 'ClassificationPathBuilder', 'org', 'pathArray',
        function($scope, $modalInstance, ClassificationPathBuilder, org, pathArray) {

    $scope.path = ClassificationPathBuilder.constructPath(org, pathArray);
    
    $scope.newClassification = {orgName: org, categories: (pathArray ? pathArray : [])};
    $scope.newClassificationValue = '';
    
    $scope.parentScope = {newClassifName: ""};

    $scope.addClassification = function () {
        $scope.newClassification.categories.push($scope.parentScope.newClassifName);
        $scope.$close($scope.newClassification);
    };
    
}]);