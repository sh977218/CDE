angular.module('systemModule').controller('MeshMappingMgtCtrl', ['$scope', 'org', 'pathArray', '$http', 'Alert', '$timeout',
    function ($scope, org, pathArray, $http, Alert, $timeout) {

        $scope.path = pathArray.join(" / ");

        $scope.descToName = {};
        $scope.meshSearch = pathArray[pathArray.length - 1];

        $scope.mapping = {
            flatClassification: org + ";" + pathArray.join(";"),
            meshDescriptors: []
        };

        $http.get('/meshClassification?classification=' +
            encodeURIComponent(org + ";" + pathArray.join(";"))).success(function(result) {
            if (result) {
                $scope.mapping = result;
                $scope.mapping.meshDescriptors.forEach(function(desc) {
                    $http.get(meshUrl + "/api/record/ui/" + desc).success(function (result) { // jshint ignore:line
                        $scope.descToName[desc] = result.DescriptorName.String.t;
                    });
                });
            }
        });

        var currentTimeout = null;

        $scope.loadDescriptor = function () {
            if (currentTimeout) currentTimeout.cancel();

            $timeout(function() {
                $http.get(meshUrl + "/api/fieldSearch/record?searchInField=termDescriptor" + // jshint ignore:line
                    "&searchType=exactMatch&q=" + $scope.meshSearch).success(function (result) {
                    try {
                        if (result.hits.hits.length === 1) {
                            var desc = result.hits.hits[0]._source;
                            $scope.descriptorName = desc.DescriptorName.String.t;
                            $scope.descriptorID = desc.DescriptorUI.t;
                        }
                    } catch (e) {
                        delete $scope.descriptorName;
                        delete $scope.descriptorID;
                    }
                }).error(function() {
                    delete $scope.descriptorName;
                    delete $scope.descriptorID;
                });
            }, 0);

        };

        $scope.loadDescriptor();

        $scope.isDescriptorAlreadyMapped = function(desc) {
            return $scope.mapping.meshDescriptors.indexOf(desc) > -1;
        };

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

        $scope.removeDescriptor = function(i) {
            $scope.mapping.meshDescriptors.splice(i, 1);
            $http.post("/meshClassification", $scope.mapping).success(function(result) {
                Alert.addAlert("success", "Saved");
                $scope.mapping = result;
            }).error(function() {
                Alert.addAlert("danger", "There was an issue saving this record.");
            });
        };

    }]);