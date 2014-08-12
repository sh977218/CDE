function ProfileCtrl($scope, ViewingHistory) {               
    ViewingHistory.getCdes({start: 0}, function(cdes) {
        $scope.cdes = cdes;
    });
}
