angular.module('cdeModule').controller('MergeRequestCtrl',
    ['$scope', '$uibModal', '$location', '$http', 'MergeRequest', 'DataElement', 'MergeCdes', 'isAllowedModel',
        function ($scope, $modal, $location, $http, MergeRequest, DataElement, MergeCdes, isAllowedModel) {
            $scope.openMergeModal = function (retiredIndex) {
                $scope.retiredIndex = retiredIndex;
                $modal.open({
                    animation: false,
                    templateUrl: '/cde/public/html/mergeModal.html',
                    controller: 'MergeModalCtrl',
                    resolve: {
                        cdeSource: function () {
                            return $http.get('/deByTinyId/' + $scope.cdes[$scope.retiredIndex].tinyId);
                        },
                        cdeTarget: function () {
                            return $http.get('/deByTinyId/' + $scope.cdes[($scope.retiredIndex + 1) % 2].tinyId);
                        }
                    }
                }).result.then(function (dat) {
                    if (dat.approval.fieldsRequireApproval && !dat.approval.ownDestinationCde) {
                        MergeRequest.create(dat, function () {
                            if (!dat.mergeRequest.source.object.registrationState)
                                dat.mergeRequest.source.object.registrationState = {};
                            dat.mergeRequest.source.object.registrationState.administrativeStatus = "Retire Candidate";
                            dat.mergeRequest.source.object.registrationState.replacedBy = {tinyId: $scope.cdes[($scope.retiredIndex + 1) % 2].tinyId};
                            DataElement.save(dat.mergeRequest.source.object, function (cde) {
                                $location.url("deCompare");
                                $scope.addAlert("success", "Merge request sent");
                            });
                        }, function () {
                            $scope.addAlert("danger", "There was an error creating this merge request.")
                        });
                    } else {
                        var gotoNewElement = function (mr) {
                            MergeCdes.approveMerge(mr.source.object, mr.destination.object, mr.mergeFields, function (cde) {
                                $location.url("deview?tinyId=" + cde.tinyId);
                                $scope.addAlert("success", "CDEs successfully merged");
                            });
                        };
                        if (dat.approval.ownDestinationCde) {
                            $scope.showVersioning(dat.mergeRequest, function () {
                                gotoNewElement(dat.mergeRequest);
                            });
                        } else {
                            gotoNewElement(dat.mergeRequest);
                        }
                    }
                }, function () {
                });
            };

            $scope.isMergeRequestPossible = function (cde, otherCde) {
                if ((!cde) || (!otherCde)) return false;
                return isAllowedModel.isAllowed(cde)
                    && !(cde.registrationState.administrativeStatus === "Retire Candidate")
                    && !(otherCde.registrationState.administrativeStatus === "Retire Candidate")
                    && !(cde.registrationState.registrationStatus === "Standard");
            };

            $scope.showVersioning = function (mergeRequest, callback) {
                $modal.open({
                    animation: false,
                    templateUrl: '/system/public/html/saveModal.html',
                    controller: 'MergeApproveModalCtrl',
                    resolve: {
                        elt: function () {
                            return mergeRequest.destination.object;
                        }
                    }
                }).result.then(callback, function () {
                });
            };
            
        }
    ]);