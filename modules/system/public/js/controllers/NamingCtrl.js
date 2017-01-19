angular.module('systemModule').controller('NamingCtrl', ['$scope', '$uibModal', 'OrgHelpers', 'Alert', '$q',
    function ($scope, $modal, OrgHelpers, Alert, $q) {

        var contextsLoaded = $q.defer();

        function refreshContexts(){
            OrgHelpers.deferred.promise.then(function () {
                $scope.allContexts = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].nameContexts;
                contextsLoaded.resolve();
            });
        }

        $scope.deferredEltLoaded.promise.then(refreshContexts);

        $scope.openNewNamePair = function () {
            if (!$scope.allContexts || $scope.allContexts.length === 0) {
                Alert.addAlert("warning", "No valid context present, have an Org Admin go to Org Management > List Management to add one");
                return;
            }

            contextsLoaded.promise.then(function () {
                $modal.open({
                    animation: false,
                    templateUrl: 'newNamePairModalContent.html',
                    controller: 'NewNamePairModalCtrl',
                    resolve: {
                        cde: function () {
                            return $scope.elt;
                        },
                        context: function () {
                            return $scope.allContexts;
                        }
                    }
                }).result.then(function () {}, function() {});
            });
        };

        $scope.stageNewName = function (namePair) {
            $scope.stageElt($scope.elt);
            namePair.editMode = false;
        };

        $scope.cancelSave = function (namePair) {
            namePair.editMode = false;
        };

        $scope.removeNamePair = function (index) {
            $scope.elt.naming.splice(index, 1);
            $scope.stageElt($scope.elt);
        };

    }]);