angular.module('systemModule').controller('MeshMappingMgtCtrl', ['$scope', 'org', 'pathArray', '$http', 'AlertService', '$timeout',
    function ($scope, org, pathArray, $http) {

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


    }]);