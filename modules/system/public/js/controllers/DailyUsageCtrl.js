function DailyUsageCtrl($scope, $http) {
    
    $scope.entryLimit = 50;
    
    $scope.seeMore = function() {
        $scope.entryLimit += 50;
    };
    
    $scope.generate = function () {
        $http.get("/logUsageDailyReport").then(function (res) {
            $scope.dailyUsage = res.data;
        });
    };    
    
    $scope.lookupUsername = function(ip) {
        $http.get("/usernamesByIp/" + ip).then(function (res) {
           var usernames = res.data;
           if (usernames.length === 0) {
               usernames = [{username: "Anonymous"}];
           }
           for (var i = 0; i < $scope.dailyUsage.length; i++) {
               if ($scope.dailyUsage[i]._id.ip === ip) {
                    $scope.dailyUsage[i].usernames = usernames;
               }
           }
        });
    };
}
