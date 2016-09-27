angular.module('systemModule').controller('NewNamePairModalCtrl', ['$scope', '$uibModalInstance', 'cde', 'context',
    function ($scope, $modalInstance, cde, context) {


    $scope.orgContexts = context;
    $scope.$apply();

    $scope.newNamePair = {
        "languageCode": "EN-US",
        "context": {
            "contextName": "",
            "acceptability": "preferred"
        }
    };
    $scope.elt = cde;
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss('cancel');
    };



    $scope.okCreate = function() {
        cde.naming.push($scope.newNamePair);
        cde.unsaved = true;
        $modalInstance.close();
    };
}]);
