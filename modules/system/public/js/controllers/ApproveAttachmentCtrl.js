angular.module('systemModule').controller('ApproveAttachmentCtrl', ['$scope', '$http', 'Alert',
    function($scope, $http, Alert) {

    $scope.approveAttachment = function(msg) {
        $http.get('/attachment/approve/' + msg.typeAttachmentApproval.fileid).then(function onSuccess(response) {
            Alert.addAlert("success", response.data);
            $scope.archiveMessage(msg);
        }).catch(function onError(response) {
            Alert.addAlert("danger", response.data);
        });
    };
    $scope.declineAttachment = function(msg) {
        $http.get('/attachment/decline/' + msg.typeAttachmentApproval.fileid).then(function onSuccess(response) {
            Alert.addAlert("success", response.data);
            $scope.archiveMessage(msg);
        }).error(function onError(response) {
            Alert.addAlert("danger", response.data);
        });
    };    
        
}]);