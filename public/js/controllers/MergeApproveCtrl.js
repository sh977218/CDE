function MergeApproveCtrl($scope, $window, DataElement, Mail) {
    $scope.approveMerge = function(message) {
        var source = message.typeMergeRequest.source.object;
        var destination = message.typeMergeRequest.destination.object;
        $scope.transferFields(source, destination, 'naming');
        $scope.transferFields(source, destination, 'attachments');
        $scope.transferFields(source, destination, 'ids');
        $scope.transferFields(source, destination, 'properties');        
        destination.version = parseInt(destination.version)+1;
        DataElement.save(destination, function(cde) {
            message.typeMergeRequest.states.unshift({
                "action" : "Approved",
                "date" : new Date(),
                "comment" : ""
            });
            Mail.updateMessage(message, function() {
                $scope.addAlert("success", "The CDEs have been merged!");   
                $scope.fetchMRCdes();
            }, function () {
                $scope.addAlert("alert", "The merge operation failed!");        
            });
            
        });
    };
    
    $scope.transferFields = function(source, destination, type) {
        var fieldsTransfer = this;
        this.alreadyExists = function(obj) {
            delete obj.$$hashKey;
            return destination[type].map(function(obj) {return JSON.stringify(obj)}).indexOf(JSON.stringify(obj))>=0;
        };
        source[type].map(function(obj) {            
            if (fieldsTransfer.alreadyExists(obj)) return;
            destination[type].push(obj);
        });
    };    
}
