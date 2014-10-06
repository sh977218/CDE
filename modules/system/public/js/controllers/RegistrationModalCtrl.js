var RegistrationModalCtrl = function($scope, $modalInstance, $http, elt, siteAdmin) {
    $scope.elt = elt;
    $scope.validRegStatuses = ['Incomplete', 'Candidate', 'Retired'];
    
    $http.get('/org/' + $scope.elt.stewardOrg.name).then(function(res) {
       if (!res.data.workingGroupOf || res.data.workingGroupIf.length === "") {
           $scope.validRegStatuses = $scope.validRegStatuses.concat(['Recorded', 'Qualified']);
           if (siteAdmin) {
               $scope.validRegStatuses = $scope.validRegStatuses.concat(['Standard', 'Preferred Standard']);
           }
       }
    });
     
    
    $scope.setHelpMessage = function() {
        regStatusShared.statusList.forEach(function(status) {
            if (status.name === $scope.elt.registrationState.registrationStatus)
                $scope.helpMessage = status.curHelp;
        });
    };

    $scope.ok = function() {
        $scope.elt.$save(function(newelt) {                      
            $modalInstance.close(newelt);
        });
    };

    $scope.cancelSave = function() {
        $modalInstance.dismiss('cancel');
    };
    
};
