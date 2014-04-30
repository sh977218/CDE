function MergeApproveCtrl($scope, $window, DataElement, Mail) {
    $scope.approveMerge = function(message) {
        var source = message.typeMergeRequest.source.object;
        var destination = message.typeMergeRequest.destination.object;
        $scope.transferNames(source, destination);
        $scope.transferAttachments(source, destination);
        $scope.transferIdentifiers(source, destination);
        $scope.transferProperties(source, destination);
        destination.version = parseInt(destination.version)+1;
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
            delete name.$$hashKey;
            if (destination.naming.map(function(name) {return JSON.stringify(name)}).indexOf(JSON.stringify(name))>=0) return;
            destination.naming.push(name);
        });
    };
    
    $scope.transferAttachments = function(source, destination) {
        if (!source.attachments) return;
        source.attachments.map(function(att) {
            if (!destination.attachments) destination.attachments = [];
            delete att.$$hashKey;
            if (destination.attachments.map(function(att) {return JSON.stringify(att)}).indexOf(JSON.stringify(att))>=0) return;
            destination.attachments.push(att);
        });
    }; 
    
    $scope.transferIdentifiers = function(source, destination) {
        if (!source.ids) return;
        source.ids.map(function(id) {
            if (!destination.ids) destination.ids = [];
            delete id.$$hashKey;
            if (destination.ids.map(function(id) {return JSON.stringify(id)}).indexOf(JSON.stringify(id))>=0) return;
            destination.ids.push(id);
        });
    };     
    
    $scope.transferProperties = function(source, destination) {
        if (!source.properties) return;
        source.properties.map(function(property) {
            if (!destination.properties) destination.properties = [];
            delete property.$$hashKey;
            if (destination.properties.map(function(property) {return JSON.stringify(property)}).indexOf(JSON.stringify(property))>=0) return;
            destination.properties.push(property);
        });
    };     
    
    /*$scope.transferClassifications = function(source, destination) {
        source.attachments.map(function(att) {
            destination.attachments.push(att);
        });
    };*/    
}
