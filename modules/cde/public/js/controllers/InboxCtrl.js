function InboxCtrl($scope, Mail, CdeList) {
    $scope.mailTypeReceived = "received";
    $scope.mailTypeSent = "sent";
    $scope.mailTypeArchived = "archived";
    
    $scope.mail = {received: [], sent: [], archived:[]};
    $scope.getMail = function(type) {
        Mail.getMail(type, null, function(mail) {
            $scope.mail[type] = mail;
            $scope.fetchMRCdes(type);
        });
    };
    $scope.getMail($scope.mailTypeReceived);
    $scope.getMail($scope.mailTypeSent);
    $scope.getMail($scope.mailTypeArchived);
    
    $scope.fetchMRCdes = function(type) {           
        var uuidList = $scope.mail[type].map(function(m) {return m.typeRequest.source.uuid;});
        uuidList = uuidList.concat($scope.mail[type].map(function(m) {return m.typeRequest.destination.uuid;}));
        CdeList.byUuidList(uuidList, function(result) {
           if (!result) {
               return;
           }
           var cdesKeyValuePair = {};
           result.map(function(cde) { cdesKeyValuePair[cde.uuid] = cde; });
           $scope.mail[type].map(function(message) {
               if (message.type!=="Merge Request") return;
               message.typeRequest.source.object = cdesKeyValuePair[message.typeRequest.source.uuid];
               message.typeRequest.destination.object = cdesKeyValuePair[message.typeRequest.destination.uuid];
           });
        });
    };
}
