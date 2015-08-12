angular.module('systemModule').controller('OrgOverviewCtrl',
['$scope', 'OrgHelpers', '$location', 'AutoCompleteResource',
function($scope, OrgHelpers, $location, AutoCompleteResource) {

    $scope.orgs = [];
    $scope.autocomplete = AutoCompleteResource;

    $scope.$watch('aggregations.orgs.buckets', function() {
        $scope.orgs = [];
        if ($scope.aggregations) {
            OrgHelpers.deferred.promise.then(function() {
                $scope.aggregations.orgs.buckets.forEach(function (org_t) {
                    var found = false;
                    if (!found) {
                        $scope.orgs.push(
                            {
                                name: org_t.key,
                                longName: OrgHelpers.orgsDetailedInfo[org_t.key].longName,
                                count: org_t.doc_count,
                                source: OrgHelpers.orgsDetailedInfo[org_t.key].uri,
                                extraInfo: OrgHelpers.orgsDetailedInfo[org_t.key].extraInfo
                            });
                    }
                });
            });
        }
    });

    $scope.searchNoOrg = function() {
        $scope.searchAction();
        if (!$scope.embedded) $location.url($scope.module + "/search");
    };

    $scope.browseOrg = function(orgName) {
        $scope.alterOrgFilter(orgName);
        if (!$scope.embedded) $location.url($scope.module + "/search");
    };

}]);