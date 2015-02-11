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
        var tinyIdList = $scope.mail[type].map(function(m) {return m.typeRequest.source.tinyId;});
        tinyIdList = tinyIdList.concat($scope.mail[type].map(function(m) {return m.typeRequest.destination.tinyId;}));
        CdeList.byTinyIdList(tinyIdList, function(result) {
           if (!result) {
               return;
           }
           var cdesKeyValuePair = {};
           result.map(function(cde) { cdesKeyValuePair[cde.tinyId] = cde; });
           $scope.mail[type].map(function(message) {
               if (message.type!=="MergeRequest") return;
               message.typeRequest.source.object = cdesKeyValuePair[message.typeRequest.source.tinyId];
               message.typeRequest.destination.object = cdesKeyValuePair[message.typeRequest.destination.tinyId];
           });
        });
    };
}
