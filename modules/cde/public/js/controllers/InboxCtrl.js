systemModule.controller('InboxCtrl', ['$scope', 'Mail', 'CdeList', function($scope, Mail, CdeList) {
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
    
    $scope.getAllMail = function() {
        $scope.getMail($scope.mailTypeReceived);
        $scope.getMail($scope.mailTypeSent);
        $scope.getMail($scope.mailTypeArchived);        
    };
    
    $scope.getAllMail();
    
    $scope.fetchMRCdes = function(type) {           
        var tinyIdList = $scope.mail[type].map(function(m) {if (m.typeRequest) return m.typeRequest.source.tinyId;});
        tinyIdList = tinyIdList.concat($scope.mail[type].map(function(m) {if (m.typeRequest) return m.typeRequest.destination.tinyId;}));
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
    
    $scope.closeMessage = function(message) {
        message.states.unshift({
            "action" : "Approved",
            "date" : new Date(),
            "comment" : ""
        });
        Mail.updateMessage(message, function() {
            $scope.addAlert("success", "Message moved to archived.");   
            $scope.getAllMail();
        }, function () {
            $scope.addAlert("danger", "Message couldn't be retired.");        
        });        
    };     
}
]);