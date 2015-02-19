function ProfileCtrl($scope, ViewingHistory, $timeout, $http, userResource) {               
    ViewingHistory.getCdes({start: 0}, function(cdes) {
        $scope.cdes = cdes;
    });
        
    $scope.saveProfile = function() {
        $timeout(function() {
            $http.post('/user/me', userResource.user).then(function(res) {
                if (res.status === 200) {
                    $scope.addAlert("success", "Saved");
                } else {
                    $scope.addAlert("danger", "Error, unable to save");                    
                }
            });
        }, 0);
    };
    
    $scope.hasQuota = true;
    if(!userResource.user.quota) {
        $scope.hasQuota = false;
    }
    
    $scope.orgCurator = userResource.user.orgCurator.toString().replace(/,/g,', ');
    
    $scope.orgAdmin = userResource.user.orgAdmin.toString().replace(/,/g,', ');
}