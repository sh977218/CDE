angular.module('systemModule').controller('ApproveAttachmentCtrl', ['$scope', '$http', 'Alert',
    function($scope, $http, Alert) {

    $scope.approveAttachment = function(msg) {
        $http.get('/attachment/approve/' + msg.typeAttachmentApproval.fileid).
            success(function(data) {
                Alert.addAlert("success", data);
                $scope.archiveMessage(msg);
            }).
            error(function(data) {
                Alert.addAlert("danger", data);
            });
    };
    $scope.declineAttachment = function(msg) {
        $http.get('/attachment/decline/' + msg.typeAttachmentApproval.fileid).
            success(function(data) {
                Alert.addAlert("success", data);
                $scope.archiveMessage(msg);
            }).
            error(function(data) {
                Alert.addAlert("danger", data);
            });
    };    
        
}]);