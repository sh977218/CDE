angular.module('cdeModule').controller('MergeApproveCtrl', ['$scope', '$uibModal', 'Mail', 'MergeCdes', 'userResource', function ($scope, $modal, Mail, MergeCdes, userResource) {



}]);

angular.module('systemModule').controller('MergeApproveModalCtrl', ['$scope', '$uibModalInstance', 'elt', 'userResource', function ($scope, $modalInstance, elt, userResource) {
    $scope.elt = elt;
    $scope.user = userResource.user;
    $scope.stewardRegStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Retired'];

    $scope.ok = function () {
        $modalInstance.close();
    };
    $scope.cancelSave = function () {
        $modalInstance.dismiss('cancel');
    };
}]);