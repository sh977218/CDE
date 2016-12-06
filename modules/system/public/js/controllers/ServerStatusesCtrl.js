angular.module('systemModule').controller('ServerStatusesCtrl', ['$scope', '$http', '$upload', '$uibModal', 'Alert',
    function ($scope, $http, $upload, $uibModal, Alert) {

        $scope.statuses = [];

        $scope.refreshStatus = function () {
            $http.get("/serverStatuses").then(function (result) {
                $scope.statuses = result.data.statuses;
                $scope.esIndices = result.data.esIndices;
            });
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
                        $http.post('/reindex/' + i).success(function () {
                            isDone = true;
                        });
                        var indexFn = setInterval(function () {
                            $http.get("indexCurrentNumDoc/" + i).success(function (result) {
                                $scope.esIndices[i].count = result.count;
                                $scope.esIndices[i].totalCount = result.totalCount;
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
                console.log("done");
            }, function () {

            });
        };

        $scope.syncMesh = function() {
            $http.post("/syncWithMesh");
            var indexFn = setInterval(function () {
                $http.get('/syncWithMesh').success(function (result) {
                    $scope.meshSyncs = result;
                    if (result.cde.done === result.cde.total
                        && result.form.done === result.form.total) {
                        clearInterval(indexFn);
                        delete $scope.meshSyncs;
                    }
                });
            }, 1000);
        };

        $scope.getNodeStatus = function (status) {
            if (status.nodeStatus === 'Running' && (new Date().getTime() - new Date(status.lastUpdate).getTime()) > (45 * 1000)) {
                return 'Not Responding';
            }
            return status.nodeStatus;
        };

        $scope.sendStop = function (server) {
            $http.post("/serverState", {
                hostname: server.hostname,
                port: server.port,
                pmPort: server.pmPort,
                action: "stop"
            }).then(function () {
                $scope.addAlert("success", "Stop sent.");
            });
        };

        $scope.sendRestart = function (server) {
            $http.post("/serverState", {
                hostname: server.hostname,
                port: server.port,
                pmPort: server.pmPort,
                action: "restart"
            }).then(function () {
                $scope.addAlert("success", "Restart request sent");
            });
        };

        $scope.refreshStatus();

        $scope.upload = function (hostname, pmPort, files) {
            if (files && files.length) {
                var file = files[0];
                $upload.upload({
                    url: '/deploy',
                    fields: {'hostname': hostname, pmPort: pmPort},
                    file: file,
                    fileFormDataName: "deployFile"
                }).progress(function (evt) {
                    $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total) + " %";
                }).success(function () {
                    delete $scope.progressPercentage;
                    $scope.addAlert("success", "Deployment complete");
                });
            }
        };

    }]);