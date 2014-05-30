function HomeCtrl($scope) {
    $scope.setActiveMenu('HOME');
    
    $scope.orgList = ['x','y'];
    
    $scope.getOrgList = function() {
        $scope.orgList = ['a','b','c','d'];
    };

}
