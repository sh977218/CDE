function DEListCtrl($scope, $controller) {
    $scope.module = "cde";         
    $scope.dragSortableOptions = {
        connectWith: ".dragQuestions"
        , handle: ".fa.fa-arrows"
        , helper: "clone"
        , appendTo: "body"
    };
    $controller('ListCtrl', {$scope: $scope}); 
}
