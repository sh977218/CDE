import * as regStatusShared from "../../../../system/shared/regStatusShared";

angular.module('systemModule').controller('RegistrationModalCtrl',
    ['$scope', '$uibModalInstance', '$http', 'elt', 'siteAdmin',
        function ($scope, $modalInstance, $http, elt, siteAdmin)
{
    $scope.elt = elt;
    $scope.validRegStatuses = ['Retired', 'Incomplete', 'Candidate' ];

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
        regStatusShared.statusList.forEach(function(status) { // jshint ignore:line
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
