var SaveModalCtrl = function($scope, $modalInstance, elt, user) {
    $scope.elt = elt;
    $scope.user = user;

    // TODO Move to RegStatus Controller
    $scope.stewardRegStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Retired'];
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
