angular.module('systemModule').controller('MeshMappingMgtCtrl', ['$scope', 'org', 'pathArray', '$http', '$timeout',
    function ($scope, org, pathArray, $http, $timeout) {

        $scope.path = pathArray.join(" / ");

        $scope.descToName = {};

        $http.get('/meshMappings?org=' + encodeURIComponent(org) + "&classification=" +
            encodeURIComponent(pathArray.join(";"))).success(function(result) {
            $scope.mapping = result;
            $scope.mapping.result.meshDescriptors.forEach(function(desc) {
                $http.get("https://meshb-qa.nlm.nih.gov/api/record/ui/" + desc).success(function (result) {
                    $scope.descToName[desc] = result.DescriptorName.String.t;
                });
            });
        }).error(function() {
            $scope.mapping = {
                org: org,
                flatClassification: pathArray.join(";"),
                meshDescriptors: []
            };
        });

        var currentTimeout = null;

        $scope.loadDescriptor = function () {
            if (currentTimeout) currentTimeout.cancel();

            $timeout(function() {
                // @TODO replace with config
                $http.get("https://meshb-qa.nlm.nih.gov/api/record/ui/" + $scope.meshID).success(function (result) {
                    try {
                        $scope.descriptorName = result.DescriptorName.String.t;
                    } catch (e) {
                        delete $scope.descriptorName;
                    }
                }).error(function() {
                    delete $scope.descriptorName;
                });
            }, 0);

        };

        $scope.addMeshDescriptor = function () {
            $scope.mapping.meshDescriptors.push($scope.meshID);
            $scope.descToName[$scope.meshID] = $scope.descriptorName;
            delete $scope.meshID;
            delete $scope.descriptorName;
        };

    }]);