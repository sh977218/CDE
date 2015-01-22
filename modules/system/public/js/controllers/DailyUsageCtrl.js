function DailyUsageCtrl($scope, $http) {
    
    $scope.entryLimit = 50;
    
    $scope.seeMore = function() {
        $scope.entryLimit += 50;
    };
    
    $scope.generate = function () {
        $http.get("/logUsageDailyReport").then(function (res) {
            $scope.dailyUsage = res.data;
            $scope.dailyUsage.forEach(function(record){
                record.daysAgo = $scope.generateDaysAgo(record._id.year, record._id.month, record._id.dayOfMonth);
            });
            $scope.dailyUsage.sort(function(u1, u2) {
                return u1.daysAgo - u2.daysAgo;
            });
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
    
    $scope.generateDaysAgo = function(year, month, day) {
        var recordDate = new Date(year, month-1, day,0,0,0,0);
        var diffMs = new Date() - recordDate;
        var diffDays = diffMs / (3600 * 24 * 1000);
        diffDays = Math.floor(diffDays);
        return diffDays;
    };
}
