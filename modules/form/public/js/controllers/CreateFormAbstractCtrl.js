var classificationShared = require('../../../../system/shared/classificationShared');

angular.module('formModule').controller('CreateFormAbstractCtrl',
    ['$scope', '$location', '$uibModal', 'userResource', 'Form',
        function ($scope, $location, $modal, userResource, Form) {
            $scope.openCdeInNewTab = true;
            $scope.module = "form";
            $scope.searchForm = {};
            $scope.classifSubEltPage = '/form/public/html/classif-elt-createForm.html';

            userResource.getPromise().then(function() {
                if (userResource.userOrgs && userResource.userOrgs.length === 1) {
                    $scope.elt.stewardOrg.name = userResource.userOrgs[0];
                }
            });

            $scope.validationErrors = function () {
                if (!$scope.elt.naming[0].designation) {
                    return "Please enter a name for the new form.";
                } else if (!$scope.elt.naming[0].definition) {
                    return "Please enter a definition for the new form.";
                } else if (!$scope.elt.stewardOrg.name) {
                    return "Please select a steward for the new form.";
                }
                if ($scope.elt.classification.length === 0) {
                    return "Please select at least one classification.";
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

            $scope.classificationToFilter = function () {
                if ($scope.elt) {
                    return $scope.elt.classification;
                }
            };

            $scope.removeClassification = function (orgName, module, elts) {
                var steward = classificationShared.findSteward($scope.elt, orgName);
                classificationShared.modifyCategory(steward.object, elts, {type: classificationShared.actions.delete});
                if (steward.object.elements.length === 0) {
                    for (var i = 0; i < $scope.elt.classification.length; i++) {
                        if ($scope.elt.classification[i].stewardOrg.name === orgName) $scope.elt.classification.splice(i, 1);
                    }
                }
            };

            $scope.openSelectDefaultClassificationModal = function () {
                $modal.open({
                    animation: false,
                    templateUrl: '/system/public/html/classifyElt.html',
                    controller: 'AddClassificationModalCtrl',
                    resolve: {
                        module: function () {
                            return $scope.module;
                        },
                        cde: function () {
                            return $scope.elt;
                        },
                        orgName: function () {
                            return undefined;
                        },
                        pathArray: function () {
                            return undefined;
                        },
                        addAlert: function () {
                            return $scope.addAlert;
                        },
                        addClassification: function () {
                            return {
                                addClassification: function (newClassification) {
                                    classificationShared.classifyItem($scope.elt, newClassification.orgName, newClassification.categories);
                                }
                            };
                        }
                    }
                }).result.then(function () {}, function() {});
            };

            $scope.showRemoveClassificationModal = function (orgName, pathArray) {
                $modal.open({
                    animation: false,
                    templateUrl: '/system/public/html/removeClassificationModal.html',
                    controller: 'RemoveClassificationModalCtrl',
                    resolve: {
                        classifName: function () {
                            return pathArray[pathArray.length - 1];
                        },
                        pathArray: function () {
                            return pathArray;
                        },
                        module: function () {
                            return $scope.module;
                        }
                    }
                }).result.then(function () {
                    $scope.removeClassification(orgName, 'form', pathArray);
                }, function () {});
            };

            $scope.save = function() {
                $scope.saving = true;
                Form.save($scope.elt, function(form) {
                    $location.url("formView?tinyId=" + form.tinyId);
                });
            };
        }
    ]);