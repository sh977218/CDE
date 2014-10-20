function DEListCtrl($scope, $controller) {
    $scope.module = "cde"; 
        
    $scope.dragSortableOptions = {
        connectWith: ".dragQuestions",
        helper: "clone",
        appendTo: "body"
    };
    $scope.searchForm = {};
    $scope.registrationStatuses = [];
    $controller('ListCtrl', {$scope: $scope}); 
}
