angular.module('systemModule').controller('ServerStatusesCtrl', ['$scope', '$http', '$upload', '$uibModal', 'Alert',
    function ($scope, $http, $upload, $uibModal, Alert) {

        $scope.statuses = [];

        $scope.refreshStatus = function () {
            $http.get("/serverStatuses").then(function (result) {
                $scope.statuses = result.data.statuses;
                $scope.esIndices = result.data.esIndices;
                $scope.statuses.forEach(function (s) {
                   s.allUp = s.elastic.up && s.elastic.indices.filter(function (ind) {
                        return ind.up;
                    }).length === s.elastic.indices.length;
                });
            }, function (error) {});
        };

        $scope.reIndex = function(i) {
            $scope.esIndices[i].count = 0;
            $uibModal.open({
                animation: false,
                templateUrl: 'confirmReindex.html',
                controller: ["i", function(i) {
                    var isDone = false;
                    $scope.i = i;
                    $scope.okReIndex = function() {
                        $http.post('/reindex/' + i).then(function onSuccess() {
                            isDone = true;
                        });
                        var indexFn = setInterval(function () {
                            $http.get("indexCurrentNumDoc/" + i).then(function onSuccess(response) {
                                $scope.esIndices[i].count = response.data.count;
                                $scope.esIndices[i].totalCount = response.data.totalCount;
                                if ($scope.esIndices[i].count >= $scope.esIndices[i].totalCount && isDone) {
                                    clearInterval(indexFn);
                                    Alert.addAlert("success", "Finished reindex " + $scope.esIndices[i].name);
                                    setTimeout(function () {
                                        $scope.esIndices[i].count = 0;
                                        $scope.esIndices[i].totalCount = 0;
                                    }, 2000);
                                }
                            });
                        }, 5000);
                    };
                }],
                resolve: {
                    i: function() {return i;}
                },
                scope: $scope
            }).result.then(function () {
            }, function () {
            });
        };

        $scope.syncMesh = function() {
            $http.post("/syncWithMesh");
            var indexFn = setInterval(function () {
                $http.get('/syncWithMesh').then(function onSuccess(response) {
                    $scope.meshSyncs = response.data;
                    if (response.data.cde.done === response.data.cde.total
                        && response.data.form.done === response.data.form.total) {
                        clearInterval(indexFn);
                        delete $scope.meshSyncs;
                    }
                }).catch(function onError() {});
            }, 1000);
        };

        $scope.getNodeStatus = function (status) {
            if (status.nodeStatus === 'Running' && (new Date().getTime() - new Date(status.lastUpdate).getTime()) > (45 * 1000)) {
                return 'Not Responding';
            }
            return status.nodeStatus;
        };

        $scope.refreshStatus();

    }]);