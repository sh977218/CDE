angular.module('systemModule').controller('NamingCtrl', ['$scope', '$uibModal', 'OrgHelpers', 'Alert', '$q', 'isAllowedModel',
    function ($scope, $modal, OrgHelpers, Alert, $q, isAllowedModel) {

        var tagsLoaded = $q.defer();

        function refreshTags(){
            OrgHelpers.deferred.promise.then(function () {
                $scope.allTags = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].nameTags.map(function (a) {
                    return {tag: a};
                });
                tagsLoaded.resolve();
            });
        }

        $scope.deferredEltLoaded.promise.then(refreshTags);

        $scope.openNewNamePair = function () {
            if (!$scope.allTags || $scope.allTags.length === 0) {
                Alert.addAlert("warning", "No valid tag present, have an Org Admin go to Org Management > List Management to add one");
                return;
            }

            tagsLoaded.promise.then(function () {
                $modal.open({
                    animation: false,
                    templateUrl: 'newNamePairModalContent.html',
                    controller: 'NewNamePairModalCtrl',
                    resolve: {
                        cde: function () {
                            return $scope.elt;
                        },
                        allTags: function () {
                            return $scope.allTags;
                        }
                    }
                }).result.then(function () {}, function() {});
            });
        };

        $scope.stageNewName = function (namePair) {
            $scope.stageElt($scope.elt);
            namePair.tags.editMode = true;
        };

        $scope.canEdit = function () {
            isAllowedModel.isAllowed($scope.elt);
        };

        $scope.cancelSave = function (namePair) {
            namePair.editMode = false;
        };

        $scope.removeNamePair = function (index) {
            $scope.elt.naming.splice(index, 1);
            $scope.stageElt($scope.elt);
        };
    }]);