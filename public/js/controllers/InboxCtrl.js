function InboxCtrl($scope, $http, $window) {
    $scope.receivedMail = [];
    $scope.getReceivedMail = function() {
        $http.get("/mail/messages/received").then(function(response) {
            $scope.receivedMail = response.data;
        });
    };
    $scope.getReceivedMail();
}
