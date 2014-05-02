function MergeApproveCtrl($scope, Mail, MergeCdes) {
    $scope.approveMergeMessage = function(message) { 
        MergeCdes.approveMerge(message.typeMergeRequest.source.object, message.typeMergeRequest.destination.object, message.typeMergeRequest.fields, function() {
            $scope.closeMessage(message);
        });
    };
    $scope.closeMessage = function(message) {
        message.typeMergeRequest.states.unshift({
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
