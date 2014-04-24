function ProfileCtrl($scope, ViewingHistory) {
    $scope.viewingHistory = [];
                
    ViewingHistory.getCdes({start: 0}, function(cdes) {
        $scope.viewingHistory = cdes;
    });
}
