var SaveModalCtrl = function($scope, $window, $modalInstance, elt, user, redirectBaseLink) {
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
            $window.location.href = redirectBaseLink + newelt._id;            
            $modalInstance.close();
        });
    };

    $scope.cancelSave = function() {
        $modalInstance.dismiss('cancel');
    };
};
