function MergeApproveCtrl($scope, $window, DataElement, Mail) {
    $scope.approveMerge = function(message) {
        var source = message.typeMergeRequest.source.object;
        var destination = message.typeMergeRequest.destination.object;
        $scope.transferNames(source, destination);
        $scope.transferAttachments(source, destination);
        $scope.transferIdentifiers(source, destination);
        DataElement.save(destination, function(cde) {
            message.typeMergeRequest.states.unshift({
                "action" : "Approved",
                "date" : new Date(),
                "comment" : ""
            });
            Mail.updateMessage(message, function() {
                $scope.addAlert("success", "The CDEs have been merged!");   
                $window.location.href = "/#/inbox";
            }, function () {
                $scope.addAlert("alert", "The merge operation failed!");        
            });
            
        });
    };
    
    $scope.transferNames = function(source, destination) {
        source.naming.map(function(name) {
            destination.naming.push(name);
        });
    };
    
    $scope.transferAttachments = function(source, destination) {
        if (!source.attachments) return;
        source.attachments.map(function(att) {
            if (!destination.attachments) destination.attachments = [];
            destination.attachments.push(att);
        });
    }; 
    
    $scope.transferIdentifiers = function(source, destination) {
        if (!source.ids) return;
        source.ids.map(function(id) {
            if (!destination.ids) destination.ids = [];
            destination.ids.push(id);
        });
    };        
    
    /*$scope.transferClassifications = function(source, destination) {
        source.attachments.map(function(att) {
            destination.attachments.push(att);
        });
    }; */     
}
