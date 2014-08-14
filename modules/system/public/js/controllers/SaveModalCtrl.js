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
        var id = $scope.elt._id;
        $scope.elt.$save(function(newelt) {
            $window.location.href = redirectBaseLink + id;
            $modalInstance.close();
        });
    };

    $scope.cancelSave = function() {
        $modalInstance.dismiss('cancel');
    };
};
