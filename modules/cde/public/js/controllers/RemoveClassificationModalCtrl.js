function RemoveClassificationModalCtrl($scope, $modalInstance, classifName) {
    $scope.classifName = classifName;
    
    $scope.ok = function() {
        $modalInstance.close();
    };
    
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };  
}