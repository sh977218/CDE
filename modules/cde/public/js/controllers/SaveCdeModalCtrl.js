var SaveCdeModalCtrl = function ($scope, $window, $modalInstance, cde, user) {
  $scope.cde = cde;
  $scope.user = user;

  $scope.stewardRegStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Retired'];
  
  $scope.setHelpMessage = function() {
      regStatusShared.statusList.forEach(function(status) {
          if (status.name === $scope.cde.registrationState.registrationStatus) $scope.helpMessage = status.curHelp;
      });
  };

  $scope.ok = function () {
    $scope.cde.$save(function (newcde) {
        $window.location.href = "/#/deview?cdeId=" + newcde._id;
        $modalInstance.close();
    });
  };

  $scope.cancelSave = function () {
    $modalInstance.dismiss('cancel');
  };
};
