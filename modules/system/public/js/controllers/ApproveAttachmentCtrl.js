angular.module('systemModule').controller('ApproveAttachmentCtrl', ['$scope', '$http', 'Mail', '$modal', function($scope, $http, Mail, $modal) {
    $scope.approveAttachment = function(msg) {
        $http.get('/attachment/approve/' + msg.typeAttachmentApproval.fileid).
            success(function(data, status, headers, config) {
                $scope.addAlert("success", data);
                $scope.closeMessage(msg);
            }).
            error(function(data, status, headers, config) {
                $scope.addAlert("danger", data);
            });
    };
    $scope.declineAttachment = function(msg) {
        $http.post('/attachment/remove', msg.typeAttachmentApproval).
            success(function(data, status, headers, config) {
                $scope.addAlert("success", data);
                $scope.closeMessage(msg);
            }).
            error(function(data, status, headers, config) {
                $scope.addAlert("danger", data);
            });
    };    
        
}]);