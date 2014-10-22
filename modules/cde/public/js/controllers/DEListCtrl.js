function DEListCtrl($scope, $controller) {
    $scope.module = "cde";         
    $scope.dragSortableOptions = {
        connectWith: ".dragQuestions",
        helper: "clone",
        appendTo: "body"
    };
    $controller('ListCtrl', {$scope: $scope}); 
}
