angular.module('systemModule').controller('RegistrationModalCtrl',
    ['$scope', '$uibModalInstance', '$http', 'elt', 'siteAdmin',
        function ($scope, $modalInstance, $http, elt, siteAdmin)
{
    $scope.elt = elt;
<<<<<<< HEAD
    $scope.validRegStatuses = ['Candidate', 'Incomplete', 'Retired' ];
=======
    $scope.validRegStatuses = ['Retired', 'Incomplete', 'Candidate' ];
>>>>>>> 2387c969b39292ac1983c04b0fe82fa3532efc3e

    $http.get('/org/' + encodeURIComponent($scope.elt.stewardOrg.name)).then(function(res) {
       if (!res.data.workingGroupOf || res.data.workingGroupOf.length < 1) {
           $scope.validRegStatuses = $scope.validRegStatuses.concat(['Recorded', 'Qualified']);
           if (siteAdmin) {
               $scope.validRegStatuses = $scope.validRegStatuses.concat(['Standard', 'Preferred Standard']);
           }
       }
        $scope.validRegStatuses.reverse();
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
    
}]);
