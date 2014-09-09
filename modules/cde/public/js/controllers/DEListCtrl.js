function DEListCtrl($scope, $controller) {
    $scope.module = "cde";
    $controller('ListCtrl', {$scope: $scope}); 
        
    $scope.dragSortableOptions = {
        connectWith: ".dragQuestions"
    };

    
}
