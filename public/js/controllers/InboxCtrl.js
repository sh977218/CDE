function InboxCtrl($scope, Mail, CdeList) {
    $scope.mailTypeReceived = "received";
    $scope.mailTypeSent = "sent";
    $scope.mailTypeArchived = "archived";
    
    $scope.mail = {received: [], sent: [], archived:[]};
    $scope.getMail = function(type) {
        Mail.getMail($scope.user, type, function(mail) {
            $scope.mail[type] = mail;
            $scope.fetchMRCdes(type);
        });
    };
    $scope.getMail($scope.mailTypeReceived);
    $scope.getMail($scope.mailTypeSent);
    $scope.getMail($scope.mailTypeArchived);
    
    $scope.fetchMRCdes = function(type) {           
        var uuidList = $scope.mail[type].map(function(m) {return m.typeMergeRequest.source.uuid;});
        uuidList = uuidList.concat($scope.mail[type].map(function(m) {return m.typeMergeRequest.destination.uuid;}));
        CdeList.byUuidList(uuidList, function(result) {
           if (!result) {
               return;
           }
           var cdesKeyValuePair = {};
           result.map(function(cde) { cdesKeyValuePair[cde.uuid] = cde; });
           $scope.mail[type].map(function(message) {
               if (message.type!=="Merge Request") return;
               message.typeMergeRequest.source.object = cdesKeyValuePair[message.typeMergeRequest.source.uuid];
               message.typeMergeRequest.destination.object = cdesKeyValuePair[message.typeMergeRequest.destination.uuid];
           });
        });
    };
}
