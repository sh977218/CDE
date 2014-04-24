var SaveCdeModalCtrl = function ($scope, $window, $modalInstance, cde, user) {
  $scope.cde = cde;
  $scope.user = user;

  $scope.stewardRegStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Retired'];

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
