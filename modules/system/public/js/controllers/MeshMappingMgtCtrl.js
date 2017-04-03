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
            encodeURIComponent(org + ";" + pathArray.join(";"))).then(function onSuccess(response) {
            if (response.data) {
                $scope.mapping = response.data;
                $scope.mapping.meshDescriptors.forEach(function (desc) {
                    $http.get(meshUrl + "/api/record/ui/" + desc).then(function onSuccess(response) { // jshint ignore:line
                        $scope.descToName[desc] = response.data.DescriptorName.String.t;
                    });
                });
            }
        });

        var currentTimeout = null;

        $scope.loadDescriptor = function () {
            if (currentTimeout) currentTimeout.cancel();

            $timeout(function() {
                $http.get(meshUrl + "/api/search/record?searchInField=termDescriptor" + // jshint ignore:line
                    "&searchType=exactMatch&q=" + $scope.meshSearch).then(function onSuccess(response) {
                    try {
                        if (response.data.hits.hits.length === 1) {
                            var desc = response.data.hits.hits[0]._source;
                            $scope.descriptorName = desc.DescriptorName.String.t;
                            $scope.descriptorID = desc.DescriptorUI.t;
                        }
                    } catch (e) {
                        delete $scope.descriptorName;
                        delete $scope.descriptorID;
                    }
                }).catch(function onError() {
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

            $http.post("/meshClassification", $scope.mapping).then(function onSuccess(response) {
                Alert.addAlert("success", "Saved");
                $scope.mapping = response.data;
            }).catch(function onError() {
                Alert.addAlert("danger", "There was an issue saving this record.");
            });
        };

        $scope.removeDescriptor = function(i) {
            $scope.mapping.meshDescriptors.splice(i, 1);
            $http.post("/meshClassification", $scope.mapping).then(function onSuccess(response) {
                Alert.addAlert("success", "Saved");
                $scope.mapping = response.data;
            }).catch(function onError() {
                Alert.addAlert("danger", "There was an issue saving this record.");
            });
        };

    }]);