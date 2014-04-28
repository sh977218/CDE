function InboxCtrl($scope, Mail, CdeList) {
    $scope.receivedMail = [];
    $scope.getReceivedMail = function() {
        Mail.getReceived($scope.user, function(mail) {
            $scope.receivedMail = mail;
            $scope.fetchMRCdes();
        });
    };
    $scope.getReceivedMail();
    
    $scope.fetchMRCdes = function() {
        var uuidList = $scope.receivedMail.map(function(m) {return m.typeMergeRequest.source.uuid;});
        uuidList = uuidList.concat($scope.receivedMail.map(function(m) {return m.typeMergeRequest.destination.uuid;}));
        CdeList.byUuidList(uuidList, function(result) {
           if (!result) {
               return;
           }
           var cdesKeyValuePair = {};
           result.map(function(cde) { cdesKeyValuePair[cde.uuid] = cde; });
           $scope.receivedMail.map(function(message) {
               if (message.type!=="Merge Request") return;
               message.typeMergeRequest.destination.object = cdesKeyValuePair[message.typeMergeRequest.destination.uuid];
           });
        });
    };
}
