angular.module('systemModule').controller('NewNamePairModalCtrl', ['$scope', '$uibModalInstance', 'cde', 'OrgHelpers',
function($scope, $modalInstance, cde, OrgHelpers) {


    $scope.newNamePair = {
        "languageCode" : "EN-US"
        , context: {
            contextName: ""
            , "acceptability" : "preferred"
        }
    };
    $scope.elt = cde;
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.orgContexts =  function() {return OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].nameContexts};

    $scope.okCreate = function() {
        cde.naming.push($scope.newNamePair);
        cde.unsaved = true;
        $modalInstance.close();
    };
}]);
