var SaveCdeModalCtrl = function ($scope, $window, $modalInstance, cde, user) {
  $scope.cde = cde;
  $scope.user = user;

  $scope.stewardRegStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Retired'];
  
  $scope.helpMessages = {
      Incomplete: "Incomplete indicates a Data Element that is not fully defined. Incomplete CDEs are not visible to the public"
      , 'Candidate':  "Candidate CDEs are not visible to the public"
      , Recorded: "Recorded CDEs are visible to the public"
      , Qualified: "Qualified CDEs should be well defined and will be visible to the public"
      , Retired: "Retired Data Elements are not returned in searches"
      , Standard : "Standard CDEs cannot be edited by their stewards"
      , "Preferred Standard" : "Preferred Standard CDEs cannot be edited by their stewards"
  };
  
  $scope.setHelpMessage = function() {
      $scope.helpMessage = $scope.helpMessages[$scope.cde.registrationState.registrationStatus];
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
