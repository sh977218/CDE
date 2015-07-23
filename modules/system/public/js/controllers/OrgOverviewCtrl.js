angular.module('systemModule').controller('OrgOverviewCtrl',
['$scope', 'OrgHelpers', '$window', '$timeout',
function($scope, OrgHelpers, $window, $timeout) {

    $scope.orgs = [];
    
    $scope.$watch('aggregations.orgs.buckets', function() {
        $scope.orgs = [];
        if ($scope.aggregations) {
            $scope.aggregations.orgs.buckets.forEach(function (org_t) {
                var found = false;
                if (!found) {
                    $scope.orgs.push(
                        {
                            name: org_t.key,
                            longName: org_t.longName,
                            count: org_t.doc_count,
                            source: OrgHelpers.orgsDetailedInfo[org_t.key].uri,
                            extraInfo: OrgHelpers.orgsDetailedInfo[org_t.key].extraInfo
                        });
                }
            });
        }
    });

    $scope.searchNoOrg = function() {
        $scope.searchAction();
        $window.location = "#/" + $scope.module + "/search";
    }

    $scope.browseOrg = function(orgName) {
        $scope.alterOrgFilter(orgName);
        $window.location = "#/" + $scope.module + "/search";
    }

}]);