angular.module('cdeModule').controller('CreateCdeAbstractCtrl',
    ['$scope', '$location', '$timeout', '$uibModal', 'DataElement', 'Elastic', 'userResource',
        function($scope, $location, $timeout, $modal, DataElement, Elastic, userResource) {
            $scope.openCdeInNewTab = true;
            $scope.currentPage = 1;
            $scope.totalItems = 0;
            $scope.resultPerPage = 20;
            $scope.module = "cde";
            $scope.searchForm = {};
            $scope.classifSubEltPage = '/cde/public/html/classif-elt-createCde.html';

            if (userResource.userOrgs.length === 1) {
                $scope.elt.stewardOrg.name = userResource.userOrgs[0];
            }

            $scope.$on('$locationChangeStart', function( event ) {
                if (!$scope.saving) {
                    var txt = "You have unsaved changes, are you sure you want to leave this page? ";
                    if (window.debugEnabled) {
                        txt = txt + window.location.pathname;
                    }
                    var answer = confirm(txt);
                    if (!answer) {
                        event.preventDefault();
                    }
                }
            });

            $scope.validationErrors = function() {
                if (!$scope.elt.naming[0].designation) {
                    return "Please enter a name for the new CDE";
                } else if (!$scope.elt.naming[0].definition) {
                    return "Please enter a definition for the new CDE";
                } else if (!$scope.elt.stewardOrg.name) {
                    return "Please select a steward for the new CDE";
                }
                if ($scope.elt.classification.length === 0) {
                    return "Please select at least one classification";
                } else {
                    var found = false;
                    for (var i = 0; i < $scope.elt.classification.length; i++) {
                        if ($scope.elt.classification[i].stewardOrg.name === $scope.elt.stewardOrg.name) {
                            found = true;
                        }
                    }
                    if (!found) {
                        return "Please select at least one classification owned by " + $scope.elt.stewardOrg.name;
                    }
                }
                return null;
            };

            $scope.classificationToFilter = function() {
                if ($scope.elt) {
                    return $scope.elt.classification;
                }
            };

            $scope.removeClassification = function(orgName, elts) {
                var steward = exports.findSteward($scope.elt, orgName);
                exports.modifyCategory(steward.object, elts, {type: exports.actions.delete});
                if (steward.object.elements.length === 0) {
                    for (var i=0; i<$scope.elt.classification.length; i++) {
                        if ($scope.elt.classification[i].stewardOrg.name === orgName) $scope.elt.classification.splice(i,1);
                    }
                }
            };


            $scope.openSelectDefaultClassificationModal = function () {
                var modalInstance = $modal.open({
                    animation: false,
                    templateUrl: '/system/public/html/classifyElt.html',
                    controller: 'AddClassificationModalCtrl',
                    resolve: {
                        module: function() {
                            return $scope.module;
                        }
                        , cde: function() {
                            return $scope.elt;
                        }
                        , orgName: function() {
                            return undefined;
                        }
                        , pathArray: function() {
                            return undefined;
                        }
                        , addAlert: function() {
                            return $scope.addAlert;
                        }
                        , addClassification: function() {
                            return {
                                addClassification: function(newClassification) {
                                    exports.classifyItem($scope.elt, newClassification.orgName, newClassification.categories);
                                }
                            };
                        }
                    }
                });

                modalInstance.result.then(function () {
                });
            };

            $scope.showRemoveClassificationModal = function(orgName, pathArray) {
                var modalInstance = $modal.open({
                    animation: false,
                    templateUrl: '/system/public/html/removeClassificationModal.html',
                    controller: 'RemoveClassificationModalCtrl',
                    resolve: {
                        classifName: function() {
                            return pathArray[pathArray.length-1];
                        },
                        pathArray: function () {
                            return pathArray;
                        },
                        module: function () {
                            return $scope.module;
                        }
                    }
                });

                modalInstance.result.then(function () {
                    $scope.removeClassification(orgName, 'cde', pathArray);
                });
            };

            $scope.save = function() {
                $scope.saving = true;
                DataElement.save($scope.elt, function(cde) {
                    $location.url("deview?tinyId=" + cde.tinyId);
                });
            };

        }
    ]);