angular.module('systemModule').controller('OrgOverviewCtrl',
['$scope', 'OrgHelpers',
function($scope, OrgHelpers) {

    $scope.orgs = [];

    //OrgHelpers.orgsDetailedInfo[org.name] = org;

    $scope.$watch('aggregations.orgs.buckets', function() {
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
                            extra: OrgHelpers.orgsDetailedInfo[org_t.key].extra
                        })
                }
            });
        }
    });


}]);