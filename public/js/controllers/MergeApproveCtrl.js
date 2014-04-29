function MergeApproveCtrl($scope, DataElement, Mail) {
    $scope.approveMerge = function(message) {
        var source = message.typeMergeRequest.source.object;
        var destination = message.typeMergeRequest.destination.object;
        $scope.transferNames(source, destination);
        DataElement.save(destination, function(cde) {
            message.typeMergeRequest.states.push({
                "action" : "Approved",
                "date" : new Date(),
                "comment" : ""
            });
            Mail.updateMessage(message, function() {
                $scope.addAlert("success", "The CDEs have been merged!");        
            }, function () {
                $scope.addAlert("alert", "The merge operation failed!");        
            });
            
        });
    };
    
    $scope.transferNames = function(source, destination) {
        source.naming.map(function(name) {
            destination.naming.push({
                designation: name.designation
                , definition: name.definition
                , context: name.context
            });
        });
    };
}
