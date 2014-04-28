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
        var uuidList = $scope.receivedMail.map(function(m) {return m.typeMergeRequest.destination.uuid});
        CdeList.byUuidList(uuidList, function(result) {
           console.log(result); 
        });
    };
}
