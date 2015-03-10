angular.module('systemModule').controller('SaveModalCtrl', ['$scope', '$modalInstance', 'elt', function($scope, $modalInstance, elt) {
    $scope.elt = elt;

    $scope.ok = function() {
        $scope.elt.$save({}, 
        function(newelt) {                      
            $modalInstance.close(newelt);
        }, function(resp) {
            $modalInstance.dismiss("Unable to save this element. This issue has been reported. ");
        });
    };

    $scope.cancelSave = function() {
        $modalInstance.dismiss('cancel');
    };

}


]);