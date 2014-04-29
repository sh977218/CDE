function MergeApproveCtrl($scope, DataElement) {
    $scope.approveMerge = function(message) {
        var source = message.typeMergeRequest.source.object;
        var destination = message.typeMergeRequest.destination.object;
        $scope.transferNames(source, destination);
        DataElement.save(destination, function(cde) {
            $scope.addAlert("success", "The CDEs have been merged!");        
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
