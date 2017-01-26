angular.module('systemModule').controller('NewNamePairModalCtrl', ['$scope', '$uibModalInstance', 'cde', 'allTags',
    function ($scope, $modalInstance, cde, allTags) {

    $scope.allTags = allTags;

    $scope.newNamePair = {
        "languageCode": "EN-US",
        "tags": []
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
