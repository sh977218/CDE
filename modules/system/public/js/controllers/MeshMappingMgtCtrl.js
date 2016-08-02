angular.module('systemModule').controller('MeshMappingMgtCtrl', ['$scope', 'org', 'pathArray', '$http', '$timeout', 'Alert',
    function ($scope, org, pathArray, $http, $timeout, Alert) {

        $scope.path = pathArray.join(" / ");

        $scope.descToName = {};
        $scope.meshSearch = pathArray[pathArray.length - 1];

        $scope.mapping = {
            org: org,
            flatClassification: pathArray.join(";"),
            meshDescriptors: []
        };

        $http.get('/meshClassification?org=' + encodeURIComponent(org) + "&classification=" +
            encodeURIComponent(pathArray.join(";"))).success(function(result) {
            if (result) {
                $scope.mapping = result;
                $scope.mapping.meshDescriptors.forEach(function(desc) {
                    $http.get("https://meshb-qa.nlm.nih.gov/api/record/ui/" + desc).success(function (result) {
                        $scope.descToName[desc] = result.DescriptorName.String.t;
                    });
                });
            }
        });

        var currentTimeout = null;

        $scope.loadDescriptor = function () {
            if (currentTimeout) currentTimeout.cancel();

            $timeout(function() {
                // @TODO replace with config
                $http.get("https://meshb-qa.nlm.nih.gov/api/fieldSearch/record?searchInField=termDescriptor" +
                    "&searchType=exactMatch&q=" + $scope.meshSearch).success(function (result) {
                    try {
                        if (result.hits.hits.length === 1) {
                            var desc = result.hits.hits[0]._source;
                            $scope.descriptorName = desc.DescriptorName.String.t;
                            $scope.descriptorID = desc.DescriptorUI.t;
                        }
                    } catch (e) {
                        delete $scope.descriptorName;
                    }
                }).error(function() {
                    delete $scope.descriptorName;
                });
            }, 0);

        };

        $scope.loadDescriptor();

        $scope.addMeshDescriptor = function () {
            $scope.mapping.meshDescriptors.push($scope.descriptorID);
            $scope.descToName[$scope.descriptorID] = $scope.descriptorName;
            delete $scope.descriptorID;
            delete $scope.descriptorName;

            $http.post("/meshClassification", $scope.mapping).success(function(result) {
                Alert.addAlert("success", "Saved");
                $scope.mapping = result;
            }).error(function() {
                Alert.addAlert("danger", "There was an issue saving this record.");
            });

        };

    }]);