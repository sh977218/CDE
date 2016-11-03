angular.module('systemModule').controller('RemoveClassificationModalCtrl',
    ['$scope', '$uibModalInstance', '$timeout', 'classifName', 'pathArray', 'module',
        function ($scope, $modalInstance, $timeout, classifName, pathArray, module) {
    $scope.classifName = classifName;
    $scope.module = module;
    $scope.userTyped = {name: ""};
    $scope.pathArray = pathArray;
    
    $scope.ok = function() {
        $modalInstance.close();
    };
    
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };  
    
    $scope.checkUserTypedName = function() {
        $timeout(function(){
            if ($scope.userTyped.name === classifName) $scope.userTypedCorrectName = true;
            else $scope.userTypedCorrectName = false;
        }, 0);
    };
    
    $scope.userTypedCorrectName = false;
}]);