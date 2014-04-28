function InboxCtrl($scope, Mail) {
    $scope.receivedMail = [];
    $scope.getReceivedMail = function() {
        Mail.getReceived($scope.user, function(mail) {
            $scope.receivedMail = mail;
        });
    };
    $scope.getReceivedMail();
}
