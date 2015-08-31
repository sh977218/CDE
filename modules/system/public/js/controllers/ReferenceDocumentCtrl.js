angular.module('systemModule').controller('ReferenceDocumentCtrl', ['$scope', '$modal', '$location', '$timeout',
    function ($scope, $modal, $location, $timeout)
{
    $scope.openNewReferenceDocument = function () {
        var modalInstance = $modal.open({
            templateUrl: 'newReferenceDocumentModalContent.html',
            controller: 'NewReferenceDocumentModalCtrl',
            resolve: {
                elt: function () {
                    return $scope.elt;
                },
                module: function () {
                    return $scope.module;
                }
            }
        });

        modalInstance.result.then(function (newReferenceDocument) {
            if (newReferenceDocument.referenceDocumentId) {
                for (var i = 0; i < $scope.elt.referenceDocuments.length; i++) {
                    if ($scope.elt.referenceDocuments[i].referenceDocumentId === newReferenceDocument.referenceDocumentId) {
                        $scope.addAlert("danger", "This reference document already exists.");
                        return;
                    }
                }
            }
            $scope.elt.referenceDocuments.push(newReferenceDocument);
            if ($scope.elt.unsaved) {
                $scope.addAlert("info", "Reference document added. Save to confirm.");
            } else {
                $scope.elt.$save(function (newElt) {
                    $location.url($scope.baseLink + newElt.tinyId + "&tab=referenceDocument");
                    $scope.addAlert("success", "Reference document Added");
                });
            }
        });
    };

    $scope.removeReferenceDocument = function (index) {
        $scope.elt.referenceDocuments.splice(index, 1);
        if ($scope.elt.unsaved) {
            $scope.addAlert("info", "Reference document removed. Save to confirm.");
        } else {
            $scope.elt.$save(function (newElt) {
                $location.url($scope.baseLink + newElt.tinyId + "&tab=referenceDocument");
                $scope.elt = newElt;
                $scope.addAlert("success", "Reference document Removed");
            });
        }
    };

    $scope.canEditReferenceDocument = function () {
        return $scope.canCurate && !$scope.elt.unsaved;
    };

    $scope.saveReferenceDocument = function () {
        $timeout(function () {
            $scope.elt.$save(function (newElt) {
                $location.url($scope.baseLink + newElt.tinyId + "&tab=referenceDocument");
                $scope.elt = newElt;
            });
        }, 0);
    };

}]);

angular.module('systemModule').controller('NewReferenceDocumentModalCtrl', ['$scope', '$modalInstance', '$http', 'module', 'elt', function ($scope, $modalInstance, $http, module, elt) {
    $scope.elt = elt;
    $scope.newReferenceDocument = {};

    $scope.okCreate = function () {
        $modalInstance.close($scope.newReferenceDocument);
    };

    $scope.cancelCreate = function () {
        $modalInstance.dismiss("Cancel");
    };
}]);
