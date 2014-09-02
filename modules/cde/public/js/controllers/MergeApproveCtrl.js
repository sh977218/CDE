function MergeApproveCtrl($scope, $modal, Mail, MergeCdes) {
    $scope.showMergeApproveDialog = function(message) {
        var modalInstance = $modal.open({
            templateUrl: '/system/public/html/saveModal.html'
            , controller: MergeApproveModalCtrl
            , resolve: {
                elt: function() {
                    return message.typeRequest.destination.object;
                } , user: function() {
                    return $scope.user;
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
    $scope.closeMessage = function(message) {
        message.typeRequest.states.unshift({
            "action" : "Approved",
            "date" : new Date(),
            "comment" : ""
        });
        Mail.updateMessage(message, function() {
            $scope.addAlert("success", "The CDEs have been merged!");   
            $scope.fetchMRCdes("received");
        }, function () {
            $scope.addAlert("alert", "The merge operation failed!");        
        });        
    };      
}

var MergeApproveModalCtrl = function ($scope, $modalInstance, elt, user) {
    $scope.cde = elt;
    $scope.elt = elt;
    $scope.user = user;
    $scope.stewardRegStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Retired'];
    $scope.ok = function () {
        $modalInstance.close();
    };    
    $scope.cancelSave = function () {
        $modalInstance.dismiss('cancel');
    };
};