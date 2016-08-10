angular.module('systemModule').controller('OrgOverviewCtrl',
    ['$scope', 'OrgHelpers', '$location', 'AutoCompleteResource', 'userResource', '$routeParams', '$anchorScroll',
    function($scope, OrgHelpers, $location, AutoCompleteResource, userResource, $routeParams, $anchorScroll)
{
    $scope.orgs = [];
    $scope.autocomplete = AutoCompleteResource;

    $scope.$watch('aggregations.orgs.buckets', function() {
        $scope.orgs = [];
        if ($scope.aggregations) {
            OrgHelpers.deferred.promise.then(function() {
                $scope.aggregations.orgs.buckets.forEach(function (org_t) {
                    var found = false;
                    if (!found) {
                        if (OrgHelpers.orgsDetailedInfo[org_t.key]) {
                            $scope.orgs.push(
                                {
                                    name: org_t.key,
                                    longName: OrgHelpers.orgsDetailedInfo[org_t.key].longName,
                                    count: org_t.doc_count,
                                    source: OrgHelpers.orgsDetailedInfo[org_t.key].uri,
                                    extraInfo: OrgHelpers.orgsDetailedInfo[org_t.key].extraInfo
                                });
                        }
                    }
                });
            });
        }
    });

    $scope.browseTopic = function(topic) {
        $location.url($scope.module + "/search?topic=" + encodeURIComponent(topic));
        $anchorScroll('top');
    };

    $scope.browseOrg = function(orgName) {
        if ($scope.embedded) {
            $scope.searchSettings.selectedOrg = orgName;
            $scope.reload();
        } else {
            $location.url($scope.module + "/search?selectedOrg=" + encodeURIComponent(orgName));
            $anchorScroll('top');
        }
    };

    $scope.browseByTopic = function () {
        $scope.byTopic = true;
    };

}]);