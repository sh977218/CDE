var SaveModalCtrl = function($scope, $modalInstance, elt) {
    $scope.elt = elt;

    $scope.ok = function() {
        $scope.elt.$save(function(newelt) {                      
            $modalInstance.close(newelt);
        });
    };

    $scope.cancelSave = function() {
        $modalInstance.dismiss('cancel');
    };

}


