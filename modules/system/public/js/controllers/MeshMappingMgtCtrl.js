angular.module('systemModule').controller('MeshMappingMgtCtrl',
    ['$scope', '$uibModalInstance', 'ClassificationPathBuilder', 'org', 'pathArray',
        function($scope, $modalInstance, ClassificationPathBuilder, org, pathArray) {

                $scope.path = ClassificationPathBuilder.constructPath(org, pathArray);



        }]);