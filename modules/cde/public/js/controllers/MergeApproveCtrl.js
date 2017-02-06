angular.module('cdeModule').controller('MergeApproveCtrl', ['$scope', '$uibModal', 'Mail', 'MergeCdes', 'userResource',
    function($scope, $modal, Mail, MergeCdes, userResource) {
    $scope.showMergeApproveDialog = function(message) {
         $modal.open({
            animation: false,
            templateUrl: '/system/public/html/saveModal.html'
            , controller: 'MergeApproveModalCtrl'
            , resolve: {
                elt: function() {
                    return message.typeRequest.destination.object;
                } , user: function() {
                    return userResource.user;
                }
            }
        }).result.then(function () {
            $scope.approveMergeMessage(message);
        }, function () {});
    };

    $scope.approveMergeMessage = function(message) {
        MergeCdes.approveMerge(message.typeRequest.source.object, message.typeRequest.destination.object, message.typeRequest.mergeFields, function() {
            $scope.archiveMessage(message);
        });
    };
}]);

angular.module('systemModule').controller('MergeApproveModalCtrl', ['$scope', '$uibModalInstance', 'elt', 'userResource',
    function ($scope, $modalInstance, elt, userResource) {
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