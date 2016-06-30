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

    $scope.viewDiffVersion = function (elt, priorCde) {
        var eltCopy = angular.copy(elt);
        var priorCdeCopy = angular.copy(priorCde);
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
    sortClassification(elt);
    sortClassification(priorCde);
    $scope.elt.flatClassifications = [];
    $scope.elt.classification.forEach(function (c) {
        var cArray = [];
        getFlatClassifications(c, cArray);
        $scope.elt.flatClassifications.push(cArray);
    });
    $scope.priorCde.flatClassifications = [];
    $scope.priorCde.classification.forEach(function (c) {
        var cArray = [];
        getFlatClassifications(c, cArray);
        $scope.priorCde.flatClassifications.push(cArray);
    });
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
    $scope.propertiesOption = {
        equal: function (a, b) {
            return a.key === b.key;
        },
        sort: function (a, b) {
            return a.key.localeCompare(b.key);
        },
        properties: [
            {label: 'Key', property: 'key'},
            {label: 'Value', property: 'value'}
        ]
    };
    $scope.referenceDocumentOption = {
        equal: function (a, b) {
            return a.title === b.title;
        },
        sort: function (a, b) {
            return a.title.localeCompare(b.title);
        },
        properties: [
            {label: 'Title', property: 'title'},
            {label: 'URI', property: 'uri'},
            {
                label: 'Provider Org',
                property: 'providerOrg'
            },
            {label: 'Language Code', property: 'languageCode'},
            {label: 'Document', property: 'document'}
        ]
    };
    $scope.classificationOption = {}
}]);


function sortClassification(elt) {
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

function getFlatClassifications(elt, classification) {
    if (elt.elements != undefined) {
        elt.elements.forEach(function (e) {
            if (e.name || (e.stewardOrg && e.stewardOrg.name)) {
                var name = e.name || (e.stewardOrg && e.stewardOrg.name);
                classification.push(name);
            }
            else getFlatClassifications(e, classification);
        })
    }
};
