angular.module('systemModule').controller('OrgOverviewCtrl',
['$scope', 'OrgHelpers', '$window',
function($scope, OrgHelpers, $window) {

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
        if (!$scope.embedded) $window.location = "#/" + $scope.module + "/search";
    };

    $scope.browseOrg = function(orgName) {
        $scope.alterOrgFilter(orgName);
        if (!$scope.embedded) $window.location = "#/" + $scope.module + "/search";
    };

}]);