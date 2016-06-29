angular.module('cdeModule').controller('CdeDiffCtrl', ['$scope', '$http', '$uibModal', 'CdeDiff', 'CdeDiffPopulate', 'PriorCdes', function ($scope, $http, $modal, CdeDiff, CdeDiffPopulate, PriorCdes) {
    $scope.viewDiff = function (elt) {
        CdeDiff.get({deId: elt._id}, function (diffResult) {
            diffResult = diffResult.filter(function (change) {
                return change.path[3] !== "isValid";
            });
            diffResult.forEach(CdeDiffPopulate.makeHumanReadable);
            $scope.cdeDiff = diffResult;
        });
    };
    var sortClassification = function (elt) {
        elt.classification = elt.classification.sort(function (c1, c2) {
            return c1.stewardOrg.name.localeCompare(c2.stewardOrg.name);
        });
        var sortSubClassif = function (classif) {
            if (classif.elements) {
                classif.elements = classif.elements.sort(function (c1, c2) {
                    if (!c1.name)
                        console.log('h');
                    return c1.name.localeCompare(c2.name);
                });
            }
        };
        var doRecurse = function (classif) {
            sortSubClassif(classif);
            if (classif.elements) {
                classif.elements.forEach(function (subElt) {
                    doRecurse(subElt);
                });
            }
        };
        elt.classification.forEach(function (classif) {
            doRecurse(classif);
        });
    };

    function getFlatClassifications(e) {
        var flatClassifications = [];
        e.classifications.forEach(function (c) {
            var f = [c.stewardOrg.name];
            var elements = c.elements;
            while (elements && elements.length > 0) {
                elements.forEach(function (element) {
                    f.push(element.name)
                });
            }
        })
    }

    $scope.viewDiffVersion = function (elt, priorCde) {
        var eltCopy = angular.copy(elt);
        var priorCdeCopy = angular.copy(priorCde);
        sortClassification(eltCopy);
        sortClassification(priorCdeCopy);
        var modalInstance = $modal.open({
            animation: false,
            templateUrl: '/system/public/html/systemTemplate/historyCompare.html',
            controller: 'CdeDiffModalCtrl',
            resolve: {
                elt: function () {
                    return eltCopy;
                },
                priorCde: function () {
                    return priorCdeCopy;
                }
            }
        });

        modalInstance.result.then(function () {
        });
    };

    $scope.nullsToBottom = CdeDiffPopulate.nullsToBottom;

    var loadPriorCdes = function () {
        if (!$scope.priorCdes) {
            if ($scope.elt.history && $scope.elt.history.length > 0) {
                PriorCdes.getCdes({cdeId: $scope.elt._id}, function (dataElements) {
                    $scope.priorCdes = dataElements;
                });
            }
        }
    };

    $scope.$on('loadPriorCdes', loadPriorCdes);

    $scope.historyCtrlLoadedPromise.resolve();

}]);

angular.module('systemModule').controller('CdeDiffModalCtrl', ['$scope', '$http', '$timeout', '$uibModalInstance', 'elt', 'priorCde', function ($scope, $http, $timeout, $modal, elt, priorCde) {
    $scope.elt = elt;
    $scope.priorCde = priorCde;
    $scope.versionOption = {
        properties: [{label: 'Version', property: 'version'}]
    };
    $scope.nameOption = {
        properties: [
            {label: 'Name', property: 'designation'}, {
                label: 'Definition',
                property: 'definition'
            }, {label: 'Context', property: 'context.contextName'}
        ]
    };
    /*
     $scope.optionArray = [, {
     properties: [
     {label: 'Title', property: 'title'},
     {label: 'URI', property: 'uri'},
     {
     label: 'Provider Org',
     property: 'providerOrg'
     },
     {label: 'Language Code', property: 'languageCode'},
     {label: 'Document', property: 'document'}
     ],
     left: $scope.elt.referenceDocuments,
     right: $scope.priorCde.referenceDocuments
     }, {
     properties: [
     {label: 'Key', property: 'key'},
     {label: 'Value', property: 'value'}
     ],
     left: $scope.elt.properties,
     right: $scope.priorCde.properties
     }];*/
}]);