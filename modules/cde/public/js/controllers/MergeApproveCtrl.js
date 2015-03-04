angular.module('cdeModule').controller('MergeApproveCtrl', ['$scope', '$modal', 'Mail', 'MergeCdes', 'userResource', function($scope, $modal, Mail, MergeCdes, userResource) {
    $scope.showMergeApproveDialog = function(message) {
        var modalInstance = $modal.open({
            templateUrl: '/system/public/html/saveModal.html'
            , controller: 'MergeApproveModalCtrl'
            , resolve: {
                elt: function() {
                    return message.typeRequest.destination.object;
                } , user: function() {
                    return userResource.user;
                } 
            }
        });           
        modalInstance.result.then(function () {
            $scope.approveMergeMessage(message);
        });        
    };    
    
    $scope.approveMergeMessage = function(message) { 
        MergeCdes.approveMerge(message.typeRequest.source.object, message.typeRequest.destination.object, message.typeRequest.mergeFields, function() {
            $scope.closeMessage(message);
        });
    }; 
}]);

angular.module('systemModule').controller('MergeApproveModalCtrl', ['$scope', '$modalInstance', 'elt', 'user', function($scope, $modalInstance, elt, user) {
    $scope.elt = elt;
    $scope.user = user;
    $scope.stewardRegStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Retired'];
    $scope.ok = function () {
        $modalInstance.close();
    };    
    $scope.cancelSave = function () {
        $modalInstance.dismiss('cancel');
    };
}]);